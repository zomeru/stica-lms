import { FieldValue } from 'firebase/firestore';

export type PendingStatus = 'Pending' | 'Approved';

export interface IBooks {
  bookId: string;
  title: string;
  isbn: string;
  accessionNumber: string;
  requestDate: FieldValue;
  pickUpDueDate: FieldValue | undefined;
  status: PendingStatus;
}
