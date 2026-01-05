import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Type,
  CaseUpper,
  CaseLower,
  CaseSensitive,
  ListOrdered
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface DescriptionEditorProps {
  value?: string;
  onChange: (plainText: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

type FontSize = 'small' | 'normal' | 'large';

const fontSizeMap: Record<FontSize, string> = {
  small: '0.875rem',
  normal: '1rem',
  large: '1.25rem',
};

export function DescriptionEditor({
  value = '',
  onChange,
  placeholder = 'Enter description...',
  className,
  disabled = false,
}: DescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  // Initialize content - show plain text value
  useEffect(() => {
    if (editorRef.current) {
      const currentText = editorRef.current.innerText || '';
      if (value !== currentText) {
        // Sanitize and set as text content
        const sanitizedValue = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
        editorRef.current.textContent = sanitizedValue;
      }
    }
  }, [value]);

  // Update formatting state based on selection
  const updateFormatState = useCallback(() => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormatState();
  }, [updateFormatState]);

  const handleChange = useCallback(() => {
    if (!editorRef.current) return;
    // Always save as plain text only
    const plain = editorRef.current.innerText || '';
    onChange(plain);
  }, [onChange]);

  const handleKeyUp = useCallback(() => {
    updateFormatState();
    handleChange();
  }, [updateFormatState, handleChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleChange();
  }, [handleChange]);

  const cycleFontSize = useCallback(() => {
    const sizes: FontSize[] = ['small', 'normal', 'large'];
    const currentIdx = sizes.indexOf(fontSize);
    const nextIdx = (currentIdx + 1) % sizes.length;
    const newSize = sizes[nextIdx];
    setFontSize(newSize);
    
    // Apply to selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = fontSizeMap[newSize];
        range.surroundContents(span);
        handleChange();
      }
    }
  }, [fontSize, handleChange]);

  // Text transformation functions
  const transformSelectedText = useCallback((transformer: (text: string) => string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    const selectedText = range.toString();
    const transformedText = transformer(selectedText);
    
    // Replace selected text
    range.deleteContents();
    range.insertNode(document.createTextNode(transformedText));
    
    // Clear selection
    selection.removeAllRanges();
    editorRef.current?.focus();
    handleChange();
  }, [handleChange]);

  const toUpperCase = useCallback(() => {
    transformSelectedText((text) => text.toUpperCase());
  }, [transformSelectedText]);

  const toLowerCase = useCallback(() => {
    transformSelectedText((text) => text.toLowerCase());
  }, [transformSelectedText]);

  const toTitleCase = useCallback(() => {
    transformSelectedText((text) => 
      text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    );
  }, [transformSelectedText]);

  return (
    <div className={cn('border rounded-md bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 border-b bg-muted/30 flex-wrap">
        <Toggle
          size="sm"
          pressed={isBold}
          onPressedChange={() => execCommand('bold')}
          disabled={disabled}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={isItalic}
          onPressedChange={() => execCommand('italic')}
          disabled={disabled}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={isUnderline}
          onPressedChange={() => execCommand('underline')}
          disabled={disabled}
          aria-label="Underline"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand('insertUnorderedList')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          aria-label="Bullet list"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => execCommand('insertOrderedList')}
          disabled={disabled}
          className="h-8 w-8 p-0"
          aria-label="Numbered list"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={cycleFontSize}
          disabled={disabled}
          className="h-8 px-2 gap-1"
          aria-label="Font size"
          title="Font Size"
        >
          <Type className="h-4 w-4" />
          <span className="text-xs capitalize">{fontSize}</span>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Case Transformations */}
        <Button
          size="sm"
          variant="ghost"
          onClick={toUpperCase}
          disabled={disabled}
          className="h-8 px-2 gap-1"
          aria-label="ALL CAPS"
          title="ALL CAPS (select text first)"
        >
          <CaseUpper className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">ABC</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={toLowerCase}
          disabled={disabled}
          className="h-8 px-2 gap-1"
          aria-label="all lowercase"
          title="all lowercase (select text first)"
        >
          <CaseLower className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">abc</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={toTitleCase}
          disabled={disabled}
          className="h-8 px-2 gap-1"
          aria-label="Title Case"
          title="Title Case (select text first)"
        >
          <CaseSensitive className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">Abc</span>
        </Button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={cn(
          'min-h-[120px] p-3 focus:outline-none prose prose-sm max-w-none',
          'dark:prose-invert',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onInput={handleChange}
        onKeyUp={handleKeyUp}
        onMouseUp={updateFormatState}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ fontSize: fontSizeMap[fontSize] }}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
