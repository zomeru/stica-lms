import { AiOutlineHistory } from 'react-icons/ai';
import {
  MdLoop,
  MdOutlineLibraryBooks,
  MdOutlineNotificationsNone,
  MdSearchOff,
} from 'react-icons/md';
import { FiBookOpen, FiUsers } from 'react-icons/fi';
import { RiFileDamageFill } from 'react-icons/ri';
import { FictionType, GenreType, NonFictionType } from '@lms/types';

export const adminSidebarItems = [
  {
    name: 'Books',
    Icon: MdOutlineLibraryBooks,
  },
  {
    name: 'Users',
    Icon: FiUsers,
  },
  {
    name: 'Send Notifications',
    Icon: MdOutlineNotificationsNone,
  },
  {
    name: 'Currently Loaned Books',
    Icon: FiBookOpen,
  },
  {
    name: 'Borrow Requests',
    Icon: MdLoop,
  },
  {
    name: 'Renewal Requests',
    Icon: MdLoop,
  },
  {
    name: 'Lost Books',
    Icon: MdSearchOff,
  },
  {
    name: 'Damaged Books',
    Icon: RiFileDamageFill,
  },
  {
    name: 'History',
    Icon: AiOutlineHistory,
  },
];

export const SORT_ITEMS = [
  {
    sort: {
      name: 'Date',
      field: 'updatedAt',
    },
    order: [
      {
        name: 'Latest',
        value: 'desc',
      },
      {
        name: 'Oldest',
        value: 'asc',
      },
    ],
  },
  {
    sort: {
      name: 'Title',
      field: 'title',
    },
    order: [
      {
        name: 'A-Z',
        value: 'asc',
      },
      {
        name: 'Z-A',
        value: 'desc',
      },
    ],
  },
  {
    sort: {
      name: 'Author',
      field: 'author',
    },
    order: [
      {
        name: 'A-Z',
        value: 'asc',
      },
      {
        name: 'Z-A',
        value: 'desc',
      },
    ],
  },
  {
    sort: {
      name: 'Genre',
      field: 'genre',
    },
    order: [
      {
        name: 'A-Z',
        value: 'asc',
      },
      {
        name: 'Z-A',
        value: 'desc',
      },
    ],
  },
];

export const DEFAULT_SORT_ITEM = {
  sortBy: 'updatedAt',
  sortOrder: 'desc' as 'desc' | 'asc',
};

export const ADD_BOOK_TEXT_INPUTS = [
  'Title',
  'Author',
  'Publisher',
  'Accession No.',
];

export const ITEMS_PER_PAGE = 10;

export const loanedBooksTableHeaders = [
  // 'Book ID',
  'Student Name',
  'Title',
  // 'Author',
  'Genre',
  'ISBN',
  'Accession No',
  'Due Date',
  'Penalty',
];

export const borrowRequestBooksTableHeaders = [
  // 'Book ID',
  'Student Name',
  'Title',
  'Author',
  'Genre',
  'ISBN',
  'Accession No',
];

export const userTableHeaders = [
  // 'Book ID',
  'Photo',
  'Student Name',
  'Email',
  'Borrowed',
  'Renewed',
  'Returned',
  'Lost',
];

export const lostBooksTableHeaders = [
  // 'Book ID',
  'Student Name',
  'Title',
  'ISBN',
  'Accession No',
  // 'Penalty',
  'Replacement status',
];

export const GENRE_TYPES: GenreType[] = ['Fiction', 'Non-Fiction'];

export const BOOK_GENRES_FICTION: FictionType[] = [
  'Action and adventure',
  'Alternate history',
  'Anthology',
  'Chick lit',
  "Children's",
  'Classic',
  'Comic book',
  'Coming-of-age',
  'Crime',
  'Drama',
  'Fairytale',
  'Fantasy',
  'Graphic novel',
  'Historical fiction',
  'Horror',
  'Mystery',
  'Paranormal romance',
  'Picture book',
  'Poetry',
  'Political thriller',
  'Romance',
  'Satire',
  'Science fiction',
  'Short story',
  'Suspense',
  'Thriller',
  'Western',
  'Young adult',
];

export const BOOK_GENRES_NONFICTION: NonFictionType[] = [
  'Art/architecture',
  'Autobiography',
  'Biography',
  'Business/economics',
  'Crafts/hobbies',
  'Cookbook',
  'Diary',
  'Dictionary',
  'Encyclopedia',
  'Finance',
  'Food',
  'Guide',
  'Health/fitness',
  'History',
  'Home and garden',
  'Humor',
  'Journal',
  'Math',
  'Memoir',
  'Personal finance',
  'Philosophy',
  'Politics',
  'Prayer',
  'Religion',
  'Review',
  'Science',
  'Self help',
  'Sports and leisure',
  'Textbook',
  'Travel',
  'True crime',
];
