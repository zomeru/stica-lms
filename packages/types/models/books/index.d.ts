export type GenreType = 'Fiction' | 'Non-Fiction';

export interface IBooks {
  title: string;
  author: string;
  publisher: string;
  accessionNumber: string;
  genreType: string;
  genre: string;
  quantity: number;
  available: number;
  imageCover: {
    url: string;
    ref: string;
  };
  views: number;
  totalBorrowed: number;
  createdAt: any;
  updatedAt: any;
  isbns: ISBNType[];
}

export interface IBookDoc extends IBooks {
  id: string;
}

export type AlgoBookDoc = IBookDoc & { objectID: string };

export interface ISBNType {
  isbn: string;
  // isAvailable: boolean;
  status: 'Lost' | 'Damaged' | 'Available' | 'Borrowed';
  borrowedBy?: string;
}

export type GenreTypes = FictionType | NonFictionType;

export interface GenreDoc {
  id: string;
  genre: string;
  categoryId: string;
}

export interface CategoryDoc {
  id: string;
  category: string;
  active: boolean;
}

export type FictionType =
  | 'Action and adventure'
  | 'Alternate history'
  | 'Anthology'
  | 'Chick lit'
  | "Children's"
  | 'Classic'
  | 'Comic book'
  | 'Coming-of-age'
  | 'Crime'
  | 'Drama'
  | 'Fairytale'
  | 'Fantasy'
  | 'Graphic novel'
  | 'Historical fiction'
  | 'Horror'
  | 'Mystery'
  | 'Paranormal romance'
  | 'Picture book'
  | 'Poetry'
  | 'Political thriller'
  | 'Romance'
  | 'Satire'
  | 'Science fiction'
  | 'Short story'
  | 'Suspense'
  | 'Thriller'
  | 'Western'
  | 'Young adult';

export type NonFictionType =
  | 'Art/architecture'
  | 'Autobiography'
  | 'Biography'
  | 'Business/economics'
  | 'Crafts/hobbies'
  | 'Cookbook'
  | 'Diary'
  | 'Dictionary'
  | 'Encyclopedia'
  | 'Finance'
  | 'Food'
  | 'Guide'
  | 'Health/fitness'
  | 'History'
  | 'Home and garden'
  | 'Humor'
  | 'Journal'
  | 'Math'
  | 'Memoir'
  | 'Personal finance'
  | 'Philosophy'
  | 'Politics'
  | 'Prayer'
  | 'Religion'
  | 'Review'
  | 'Science'
  | 'Self help'
  | 'Sports and leisure'
  | 'Textbook'
  | 'Travel'
  | 'True crime';
