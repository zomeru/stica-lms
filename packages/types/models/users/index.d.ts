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
  accessionNumber: string;
  imageCover: {
    url: string;
    ref: string;
  };
  createdAt: any;
}

export interface ILikedBookDoc extends ILikedBooks {
  id: string;
}
