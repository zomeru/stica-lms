import { FieldValue } from 'firebase/firestore';

export type PendingStatus = 'Pending' | 'Approved';

export interface IBorrow {
  userId: string;
  bookId: string;
  title: string;
  isbn: string;
  accessionNumber: string;
  requestDate: FieldValue;
  status: PendingStatus;
  pickUpDueDate?: FieldValue;
}

export interface IBorrowDoc extends IBorrow {
  id: string;
}
