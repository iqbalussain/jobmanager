import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Type,
  Minus,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DescriptionEditorProps {
  value?: string;
  plainValue?: string;
  onChange: (html: string, plain: string) => void;
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

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
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
    handleChange();
  }, []);

  const handleChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.innerHTML;
    const plain = editorRef.current.innerText || '';
    
    onChange(html, plain);
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

  return (
    <div className={cn('border rounded-md bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 border-b bg-muted/30">
        <Toggle
          size="sm"
          pressed={isBold}
          onPressedChange={() => execCommand('bold')}
          disabled={disabled}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={isItalic}
          onPressedChange={() => execCommand('italic')}
          disabled={disabled}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={isUnderline}
          onPressedChange={() => execCommand('underline')}
          disabled={disabled}
          aria-label="Underline"
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
        >
          <List className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={cycleFontSize}
          disabled={disabled}
          className="h-8 px-2 gap-1"
          aria-label="Font size"
        >
          <Type className="h-4 w-4" />
          <span className="text-xs capitalize">{fontSize}</span>
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
