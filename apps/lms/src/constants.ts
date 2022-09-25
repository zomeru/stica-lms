import {
  AiOutlineHistory,
  AiOutlineHome,
  AiOutlineMessage,
  AiOutlineSearch,
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
    name: 'Currently Issued Books',
    Icon: FiBookOpen,
  },
  {
    name: 'Pending Requests',
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

export const sortItems = ['Relevance', 'Latest', 'Popular'];

export const pendingRequestTableHeaders = [
  // 'Book ID',
  'ISBN',
  'Title',
  'Request Date',
  'Pick-up Due Date',
  'Status',
];

export const issuedBooksTableHeaders = [
  // 'Book ID',
  'ISBN',
  'Title',
  'Issued Date',
  'Due Date',
  'Penalty',
];

export const historyTableHeaders = [
  // 'Book ID',
  'ISBN',
  'Title',
  // 'Requested Date',
  'Issued Date',
  'Due Date',
  'Returned Date',
  'Penalty',
  'Status',
];

export const requestStatus = ['Pending', 'Approved'];

export const historyStatus = [
  'Cancelledasdas',
  'Returned',
  'Returned with damage',
  'Lost',
];
