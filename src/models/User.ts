export interface User {
  userId: number;
  name: string;
  email?: string;
  status?: boolean
  phone?: string;
  dateOfBirth?: Date;
}
