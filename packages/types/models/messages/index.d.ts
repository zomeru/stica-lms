export interface ChatMates {
  id: string;
  userId: string;
  lastSender: 'user' | 'admin';
  lastMessageText: string;
  lastMessageTimestamp: any;
  userOpened: boolean;
  adminOpened: boolean;
  userPhoto: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}
