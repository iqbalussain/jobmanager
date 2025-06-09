
import { sanitizeInput } from '@/utils/inputValidation';

export function checkAccess(user: any) {
  if (!user) {
    throw new Error('Authentication required');
  }
  return true;
}

export function validateStatusUpdate(id: string, status: string) {
  // Validate input
  const sanitizedId = sanitizeInput(id);
  const sanitizedStatus = sanitizeInput(status);
  
  // Validate status against allowed values
  const allowedStatuses = ['pending', 'in-progress', 'designing', 'completed', 'finished', 'cancelled', 'invoiced'];
  if (!allowedStatuses.includes(sanitizedStatus)) {
    throw new Error('Invalid status value');
  }
  
  return { sanitizedId, sanitizedStatus };
}
