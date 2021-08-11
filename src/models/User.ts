export interface User {
  userId: string;
  name: string;
  email?: string;
  status?: boolean
  phone?: string;
  dateOfBirth?: Date;
}
