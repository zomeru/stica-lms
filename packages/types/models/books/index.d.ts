import { FieldValue } from 'firebase/firestore';

export type GenreType = 'Fiction' | 'Non-Fiction';

export interface IBooks {
  title: string;
  author: string;
  publisher: string;
  accessionNumber: string;
  genreType: GenreType;
  genre: GenreTypes;
  quantity: number;
  available: number;
  imageCover: {
    url: string;
    ref: string;
  };
  views: number;
  totalBorrow: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  isbns: ISBNType[];
}

export interface IBookDoc extends IBooks {
  id: string;
}

export interface ISBNType {
  isbn: string;
  isAvailable: boolean;
  issuedBy?: string;
}

export type GenreTypes = FictionType | NonFictionType;

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
  | 'Food'
  | 'Guide'
  | 'Health/fitness'
  | 'History'
  | 'Home and garden'
  | 'Humor'
  | 'Journal'
  | 'Math'
  | 'Memoir'
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
