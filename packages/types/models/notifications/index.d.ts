type NotificationType =
  | 'Borrow'
  | 'Return'
  | 'Renew'
  | 'Replace'
  | 'Penalty'
  | 'Lost'
  | 'Damaged'
  | 'Cancel';

export interface Notifications {
  createdAt: any;
  clicked: boolean;
  type: NotificationType;
  message?: string;
  borrowId?: string;
}

export interface INotifications extends Notifications {
  userId: string;
}

export interface IAdminNotifications extends Notifications {
  studentName: string;
  studentId: string;
  studentPhoto?: string;
  bookTitle?: string;
}

export interface INotificationsDoc extends INotifications {
  id: string;
}

export interface IAdminNotificationsDoc extends IAdminNotifications {
  id: string;
}
