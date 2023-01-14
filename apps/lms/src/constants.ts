import {
  AiOutlineHistory,
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineHeart,
  AiOutlineInfoCircle,
  AiOutlineMessage,
} from 'react-icons/ai';
import {
  // MdOutlineContactPage,
  MdPendingActions,
  MdSearchOff,
} from 'react-icons/md';
import { FiBookOpen } from 'react-icons/fi';
import { RiFileDamageFill } from 'react-icons/ri';
import { TbMessages } from 'react-icons/tb';

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
    name: 'Message Admin',
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
  {
    name: 'FAQ',
    Icon: TbMessages,
  },
  // {
  //   name: 'Contact',
  //   Icon: MdOutlineContactPage,
  // },
  {
    name: 'About',
    Icon: AiOutlineInfoCircle,
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
  // {
  //   name: 'Contact',
  //   Icon: MdOutlineContactPage,
  // },
  {
    name: 'FAQ',
    Icon: TbMessages,
  },
  {
    name: 'About',
    Icon: AiOutlineInfoCircle,
  },
];

interface IFAQs {
  id: string;
  question: string;
  answer: Array<{
    text: string;
    coloredText?: string;
    link?: string;
  }>;
}

export const FAQS: IFAQs[] = [
  {
    id: 'faq1',
    question: 'How do I borrow a book?',
    answer: [
      {
        text: 'You can borrow a book by clicking on the "Borrow" button on the book card or book details page.',
      },
      {
        text: 'You can also borrow a book by directly going to the school library and borrowing it from there.',
      },
      {
        text: 'Note: Some books may not be available for borrowing.',
      },
    ],
  },
  {
    id: 'faq2',
    question: 'How do I renew a book?',
    answer: [
      {
        text: 'You can renew a book by clicking on the "Renew" button inside the "Currently Issued Books" module.',
      },
      {
        text: 'Note: You can only renew the book 24 hours before the due date and if it is not overdue.',
      },
    ],
  },
  {
    id: 'faq3',
    question: 'What is the penalty for overdue books?',
    answer: [
      {
        text: 'The penalty for overdue books is 5 pesos per day (weekends and holidays are not included).',
      },
    ],
  },
  {
    id: 'faq4',
    question: 'What happens if I lose a book?',
    answer: [
      {
        text: 'If you lose a book, go to the school library and report it to the librarian to avoid more penalty.',
      },
      {
        text: 'You will also need to replace the book with the same title and author.',
      },
    ],
  },
  {
    id: 'faq5',
    question: 'What happens if I break the book?',
    answer: [
      {
        text: 'Same as losing a book, you will need to report it to the librarian and replace the book with the same title and author.',
      },
    ],
  },
  {
    id: 'faq6',
    question: 'How many books can I borrow at a time?',
    answer: [
      {
        text: 'TBD',
      },
    ],
  },
];

export const capstone_team = [
  {
    name: 'Zomer Gregorio',
    photo: '/assets/images/team/zoms.PNG',
    role: 'Team Lead & Lead Developer',
  },
  {
    name: 'Mark Joseph Yoldi',
    photo: '/assets/images/team/marky.jpg',
    role: 'UI/UX Designer',
  },
  {
    name: 'Joshua Pamisa',
    photo: '/assets/images/team/josh.jpeg',
    role: 'Research Specialist',
  },
  {
    name: 'Lourence Jacaba',
    photo: '/assets/images/team/lourence.png',
    role: 'Research Specialist',
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

export const ITEMS_PER_PAGE = 10;

export const pendingRequestTableHeaders = [
  // 'Book ID',
  'Title',
  'ISBN',
  'Accession No',
  'Request Date',
  'Pick-up Due Date',
  // 'Status',
];

export const issuedBooksTableHeaders = [
  // 'Book ID',
  'Title',
  'ISBN',
  'Accession No',
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

export const lostBooksTableHeaders = [
  // 'Book ID',
  // 'Student Name',
  'Title',
  'Author',
  'ISBN',
  'Accession No',
  'Penalty',
  'Replacement status',
];

export const requestStatus = ['Pending', 'Approved'];

export const historyStatus = ['Cancelled', 'Returned', 'Damaged', 'Lost'];

export const LMS_PREVIOUS_LOGGED_IN_KEY = 'IS_LMS_PREVIOUSLY_LOGGED_IN';

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
  'Finance',
  'Personal finance',
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
