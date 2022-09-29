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
