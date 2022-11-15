export type BorrowStatus =
  | 'Pending'
  | 'Issued'
  | 'Returned'
  | 'Returned with damage'
  | 'Lost'
  | 'Cancelled';

export interface IBorrow {
  userId: string;
  studentName: string;
  bookId: string;
  title: string;
  author: string;
  genre: string;
  category: string;
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
  replaceStatus?: 'Pending' | 'Replaced';
}

export interface IBorrowDoc extends IBorrow {
  id: string;
}

export type AlgoBorrowDoc = IBorrowDoc & { objectID: string };
