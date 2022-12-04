type NotificationType =
  | 'Borrow'
  | 'Return'
  | 'Renew'
  | 'Renewed'
  | 'Replace'
  | 'Penalty'
  | 'Lost'
  | 'Damaged'
  | 'Cancelled'
  | 'PickedUp';

export interface Notifications {
  createdAt: any;
  clicked: boolean;
  type: NotificationType;
  message: string;
  borrowId?: string;
  bookTitle?: string;
}

export interface INotifications extends Notifications {
  userId: string;
}

export interface IAdminNotifications extends Notifications {
  studentName: string;
  studentId: string;
  studentPhoto?: string;
}

export interface INotificationsDoc extends INotifications {
  id: string;
}

export interface IAdminNotificationsDoc extends IAdminNotifications {
  id: string;
}
