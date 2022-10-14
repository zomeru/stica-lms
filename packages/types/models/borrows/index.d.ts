export type BorrowStatus =
  | 'Pending'
  | 'Issued'
  | 'Returned'
  | 'Returned with damage'
  | 'Lost'
  | 'Cancelled';

export interface IBorrow {
  userId: string;
  bookId: string;
  title: string;
  isbn: string;
  accessionNumber: string;
  requestDate: any;
  status: BorrowStatus;
  penalty: number;
  updatedAt: any;
  pickUpDueDate: any;
  issuedDate?: any;
  returnedDate?: any;
  dueDate?: any;
}

export interface IBorrowDoc extends IBorrow {
  id: string;
}
