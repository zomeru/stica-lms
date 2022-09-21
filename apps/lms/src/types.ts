import { FieldValue } from 'firebase/firestore';
import { IconType } from 'react-icons';

export interface SideBarItemsType {
  name: string;
  Icon: IconType;
}

export interface IUser {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  email: string;
  username: string;
  numSuccessBookRequest: number;
  numFailedBookRequest: number;
  numSuccessRenewalRequest: number;
  numFailedRenewalRequest: number;
  numSuccessBookReturnRequest: number;
  numFailedBookReturnRequest: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  photo?: string;
}
