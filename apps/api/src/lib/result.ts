// Generic service result type
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: number; message: string } }
