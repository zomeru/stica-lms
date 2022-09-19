import {
  AiOutlineHistory,
  AiOutlineHome,
  AiOutlineMessage,
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
    name: 'Contact',
    Icon: MdOutlineContactPage,
  },
];
