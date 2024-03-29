export type BorrowStatus =
  | 'Pending'
  | 'Issued'
  | 'Returned'
  | 'Damaged'
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
  copyright: string;
  // isbn: string;
  publisher: string;
  identifiers: {
    isbn: string;
    accessionNumber: string;
  };
  // accessionNumber: string;
  requestDate: any;
  status: BorrowStatus;
  penalty: number;
  updatedAt: any;
  pickUpDueDate: any;
  issuedDate?: any;
  returnedDate?: any;
  dueDate?: any;
  replaceStatus?: 'Pending' | 'Replaced';
  renewRequest?: boolean;
  renewRequestDate?: any;
}

export interface IBorrowDoc extends IBorrow {
  id: string;
}

export type AlgoBorrowDoc = IBorrowDoc & { objectID: string };
