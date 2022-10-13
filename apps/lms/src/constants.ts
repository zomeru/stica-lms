import {
  AiOutlineHistory,
  AiOutlineHome,
  AiOutlineMessage,
  AiOutlineSearch,
  AiOutlineHeart,
} from 'react-icons/ai';
import { MdOutlineContactPage, MdPendingActions } from 'react-icons/md';
import { FiBookOpen } from 'react-icons/fi';

import { SideBarItemsType } from './types';

export const loggedInSidebarItems: SideBarItemsType[] = [
  {
    name: 'Home',
    Icon: AiOutlineHome,
  },
  {
    name: 'Search',
    Icon: AiOutlineSearch,
  },
  {
    name: 'Messages',
    Icon: AiOutlineMessage,
  },
  {
    name: 'My Likes',
    Icon: AiOutlineHeart,
  },
  {
    name: 'Currently Issued Books',
    Icon: FiBookOpen,
  },
  {
    name: 'Borrow Requests',
    Icon: MdPendingActions,
  },

  {
    name: 'History',
    Icon: AiOutlineHistory,
  },
  {
    name: 'Contact',
    Icon: MdOutlineContactPage,
  },
];

export const loggedOutSidebarItems: SideBarItemsType[] = [
  {
    name: 'Home',
    Icon: AiOutlineHome,
  },
  {
    name: 'Search',
    Icon: AiOutlineSearch,
  },
  {
    name: 'Contact',
    Icon: MdOutlineContactPage,
  },
];

export const SORT_ITEMS = [
  {
    sort: {
      name: 'Relevance',
      field: 'views',
    },
    order: [
      {
        name: 'Most viewed',
        value: 'desc',
      },
      {
        name: 'Least viewed',
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

export const sortItems = ['Relevance', 'Latest'];

export const pendingRequestTableHeaders = [
  // 'Book ID',
  'Title',
  'ISBN',
  'Accession No',
  'Request Date',
  'Pick-up Due Date',
  'Status',
];

export const issuedBooksTableHeaders = [
  // 'Book ID',
  'Title',
  'ISBN',
  'Issued Date',
  'Due Date',
  'Penalty',
];

export const likedBooksTableHeaders = [
  // 'Book ID',
  'Cover',
  'Title',
  'Author',
  'Genre',
  'Accession No',
];

export const historyTableHeaders = [
  // 'Book ID',
  'Title',
  'ISBN',
  // 'Requested Date',
  'Issued Date',
  'Due Date',
  'Returned Date',
  'Penalty',
  'Status',
];

export const requestStatus = ['Pending', 'Approved'];

export const historyStatus = [
  'Cancelled',
  'Returned',
  'Returned with damage',
  'Lost',
];

export const BOOK_GENRES_FICTION = [
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

export const BOOK_GENRES_NONFICTION = [
  'Art/architecture',
  'Autobiography',
  'Biography',
  'Business/economics',
  'Crafts/hobbies',
  'Cookbook',
  'Diary',
  'Dictionary',
  'Encyclopedia',
  'Food',
  'Guide',
  'Health/fitness',
  'History',
  'Home and garden',
  'Humor',
  'Journal',
  'Math',
  'Memoir',
  'Philosophy',
  'Politics',
  'Prayer',
  'Religion',
  'Textbook',
  'True crime',
  'Review',
  'Science',
  'Self help',
  'Sports and leisure',
  'Travel',
  'True crime',
];
