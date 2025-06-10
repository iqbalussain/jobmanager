
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return { 
      bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", 
      text: "#dc2626", 
      border: "#f87171",
      shadow: "0 4px 15px rgba(220, 38, 38, 0.25)"
    };
    case "medium": return { 
      bg: "linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)", 
      text: "#d97706", 
      border: "#f59e0b",
      shadow: "0 4px 15px rgba(217, 119, 6, 0.25)"
    };
    case "low": return { 
      bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", 
      text: "#16a34a", 
      border: "#22c55e",
      shadow: "0 4px 15px rgba(22, 163, 74, 0.25)"
    };
    default: return { 
      bg: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
      text: "#6b7280", 
      border: "#9ca3af",
      shadow: "0 4px 15px rgba(107, 114, 128, 0.25)"
    };
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return { 
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", 
      text: "#2563eb", 
      border: "#3b82f6",
      shadow: "0 4px 15px rgba(37, 99, 235, 0.25)"
    };
    case "in-progress": return { 
      bg: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)", 
      text: "#ea580c", 
      border: "#f97316",
      shadow: "0 4px 15px rgba(234, 88, 12, 0.25)"
    };
    case "completed": return { 
      bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", 
      text: "#16a34a", 
      border: "#22c55e",
      shadow: "0 4px 15px rgba(22, 163, 74, 0.25)"
    };
    case "cancelled": return { 
      bg: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
      text: "#6b7280", 
      border: "#9ca3af",
      shadow: "0 4px 15px rgba(107, 114, 128, 0.25)"
    };
    case "designing": return { 
      bg: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)", 
      text: "#9333ea", 
      border: "#a855f7",
      shadow: "0 4px 15px rgba(147, 51, 234, 0.25)"
    };
    case "finished": return { 
      bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", 
      text: "#059669", 
      border: "#10b981",
      shadow: "0 4px 15px rgba(5, 150, 105, 0.25)"
    };
    case "invoiced": return { 
      bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", 
      text: "#059669", 
      border: "#10b981",
      shadow: "0 4px 15px rgba(5, 150, 105, 0.25)"
    };
    default: return { 
      bg: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", 
      text: "#6b7280", 
      border: "#9ca3af",
      shadow: "0 4px 15px rgba(107, 114, 128, 0.25)"
    };
  }
};

export const createStyledElement = () => {
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";
  element.style.color = '#1f2937';
  element.style.width = '794px'; // A4 width at 96 DPI
  element.style.minHeight = '1123px'; // A4 height at 96 DPI
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  element.style.fontSize = '14px';
  element.style.lineHeight = '1.6';
  element.style.fontWeight = '400';
  element.style.WebkitFontSmoothing = 'antialiased';
  element.style.MozOsxFontSmoothing = 'grayscale';
  return element;
};
