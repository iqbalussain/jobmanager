
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "medium": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "low": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    default: return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "in-progress": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "completed": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "cancelled": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "designing": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "finished": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    case "invoiced": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
    default: return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#1e40af", 
      border: "#3b82f6",
      shadow: "0 3px 12px rgba(30, 64, 175, 0.2)"
    };
  }
};

export const createStyledElement = () => {
  const element = document.createElement('div');
  element.style.padding = '0px';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";
  element.style.color = '#1f2937';
  element.style.width = '794px'; // A4 width at 96 DPI
  element.style.minHeight = '1050px'; // Slightly less than A4 height to ensure single page
  element.style.maxHeight = '1050px'; // Ensure it doesn't exceed single page
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  element.style.fontSize = '13px';
  element.style.lineHeight = '1.5';
  element.style.fontWeight = '400';
  element.style.overflow = 'hidden'; // Prevent content overflow
  // Use bracket notation to avoid TypeScript errors
  (element.style as any).webkitFontSmoothing = 'antialiased';
  (element.style as any).mozOsxFontSmoothing = 'grayscale';
  return element;
};
