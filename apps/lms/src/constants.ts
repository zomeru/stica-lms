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
];

export const sortItems = ['Relevance', 'Latest', 'Popular'];
