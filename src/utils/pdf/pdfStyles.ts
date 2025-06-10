
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" };
    case "medium": return { bg: "#fef3c7", text: "#d97706", border: "#fed7aa" };
    case "low": return { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" };
    default: return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return { bg: "#dbeafe", text: "#2563eb", border: "#bfdbfe" };
    case "in-progress": return { bg: "#fed7aa", text: "#ea580c", border: "#fdba74" };
    case "completed": return { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" };
    case "cancelled": return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
    case "designing": return { bg: "#e9d5ff", text: "#9333ea", border: "#d8b4fe" };
    case "finished": return { bg: "#d1fae5", text: "#059669", border: "#a7f3d0" };
    case "invoiced": return { bg: "#d1fae5", text: "#059669", border: "#a7f3d0" };
    default: return { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };
  }
};

export const createStyledElement = () => {
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.style.backgroundColor = '#ffffff';
  element.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  element.style.color = '#1f2937';
  element.style.width = '740px';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  return element;
};
