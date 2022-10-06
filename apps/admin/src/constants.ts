import { AiOutlineHistory, AiOutlineMessage } from 'react-icons/ai';
import { MdLoop, MdOutlineLibraryBooks } from 'react-icons/md';
import { FiBookOpen, FiUsers } from 'react-icons/fi';

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
    name: 'Messages',
    Icon: AiOutlineMessage,
  },
  {
    name: 'Currently Issued Books',
    Icon: FiBookOpen,
  },
  {
    name: 'Issue Requests',
    Icon: MdLoop,
  },
  {
    name: 'Renewal Requests',
    Icon: MdLoop,
  },
  {
    name: 'History',
    Icon: AiOutlineHistory,
  },
];

export const ADD_BOOK_TEXT_INPUTS = [
  'Title',
  'Author',
  'Publisher',
  'Accession No.',
];

export const GENRE_TYPES = ['Fiction', 'Non-Fiction'];

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
  'Review',
  'Science',
  'Self help',
  'Sports and leisure',
  'Textbook',
  'Travel',
  'True crime',
];
