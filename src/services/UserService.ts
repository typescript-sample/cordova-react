import { User } from '../models/User';

export interface UserService {
  all();
  load(id: string): Promise<User>;
  insert(user: User): Promise<number>;
  insertMany(users: User[]): Promise<number>;
  update(user: User): Promise<number>;
  delete(id: string): Promise<number>;
}
