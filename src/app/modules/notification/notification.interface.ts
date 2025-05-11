import { Types } from "mongoose";

export type TNotification = {
  userId?: Types.ObjectId;
  title?:string
  message: string;
  role?: 'admin' | 'user' ;
  type?: 'info' | 'warning' | 'error' | 'success' | "announcement";
  status?: 'pending' | 'accept' | 'cancel';
  isRead: boolean;
};
