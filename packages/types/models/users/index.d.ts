export type AdminRole =
  | 'admin'
  | 'student assistant'
  | 'custom'
  | undefined;

export interface IUser {
  displayName: string;
  givenName: string;
  surname: string;
  email: string;
  totalBorrowedBooks: number;
  totalRenewedBooks: number;
  totalReturnedBooks: number;
  totalDamagedBooks: number;
  totalLostBooks: number;
  createdAt: any;
  updatedAt: any;
  photo: {
    url: string;
    ref: string;
  };
  terminated?: boolean;
  isAdmin?: boolean;
  adminRole?: AdminRole;
  adminPrivileges?: {
    modifyUser?: boolean;
    modifyTerminatedUsers?: boolean;
    modifyMasterList?: boolean;
    modifyBook?: boolean;
    canMessage?: boolean;
    walkin?: boolean;
    issued?: boolean;
    borrow?: boolean;
    renewal?: boolean;
    lost?: boolean;
    damaged?: boolean;
    archive?: boolean;
    reports?: boolean;
  };
}

export interface IUserDoc extends IUser {
  id: string;
}

export type AlgoUserDoc = IUserDoc & { objectID: string };

export interface ILikedBooks {
  bookId: string;
  title: string;
  author: string;
  genre: string;
  identifiers: {
    isbn: string;
    accessionNumber: string;
  };
  imageCover: {
    url: string;
    ref: string;
  };
  createdAt: any;
}

export interface ILikedBookDoc extends ILikedBooks {
  id: string;
}
