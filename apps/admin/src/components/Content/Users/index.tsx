import React from 'react';
import toast from 'react-hot-toast';
import nProgress from 'nprogress';
import Image from 'next/image';
import ReactTooltip from 'react-tooltip';
import { AiOutlineCopy } from 'react-icons/ai';
import { useRouter } from 'next/router';
import Modal from 'react-modal';

import { useAlgoData, useClientPagination, useNextQuery } from '@lms/ui';
import { ITEMS_PER_PAGE, userTableHeaders } from '@src/constants';
import { copyToClipboard } from '@src/utils';
import { AdminRole, AlgoUserDoc } from '@lms/types';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { db } from '@lms/db';
import { FaCheck } from 'react-icons/fa';

const userSearchQueryName = 'userSearchKey';

const PrivilegeComp = ({
  text,
  value,
  setValue,
}: {
  text: string;
  value: boolean | undefined;
  setValue: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}) => {
  return (
    <div className='flex items-center'>
      <p>{text}: </p>
      <div className='ml-1 flex items-center space-x-1'>
        <button
          type='button'
          className='flex items-center space-x-1 rounded-md border border-neutral-400 px-3 py-[3px] text-sm'
          onClick={() => {
            setValue(false);
          }}
        >
          <div
            className={`h-[14px] w-[14px] rounded-full  ${
              !value ? 'bg-primary' : 'border-primary border'
            }`}
          />
          <p>No</p>
        </button>
        <button
          type='button'
          className='flex items-center space-x-1 rounded-md border border-neutral-400 px-3 py-[3px] text-sm'
          onClick={() => setValue(true)}
        >
          <div
            className={`h-[14px] w-[14px] rounded-full  ${
              value ? 'bg-primary' : 'border-primary border'
            }`}
          />
          <p>Yes</p>
        </button>
      </div>
    </div>
  );
};

const modalCustomStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
    borderRadius: '15px',
    overflow: 'auto',
    maxHeight: '100vh',
  },
};

interface ModifyUserModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: AlgoUserDoc | null;
  setSelectedUser: React.Dispatch<
    React.SetStateAction<AlgoUserDoc | null>
  >;
}

const ModifyUserModal = ({
  isModalOpen,
  setIsModalOpen,
  selectedUser,
  setSelectedUser,
}: ModifyUserModalProps) => {
  const [customPrivileges, setCustomPrivileges] = React.useState<
    boolean | undefined
  >(selectedUser?.isAdmin);
  const [role, setRole] = React.useState<AdminRole>(undefined);
  const [updating, setUpdating] = React.useState(false);

  const [canModifyUsers, setCanModifyUsers] = React.useState<
    boolean | undefined
  >(false);
  const [canModifyBooks, setCanModifyBooks] = React.useState<
    boolean | undefined
  >(false);
  const [canModifyTerminatedUsers, setCanModifyTerminatedUsers] =
    React.useState<boolean | undefined>(false);
  const [canModifyMasters, setCanModifyMasters] = React.useState<
    boolean | undefined
  >(false);
  const [canMessageStudents, setCanMessageStudents] = React.useState<
    boolean | undefined
  >(false);
  const [canIssueWalkin, setCanIssueWalkin] = React.useState<
    boolean | undefined
  >(false);
  const [canModfiyIssuedBooks, setCanModfiyIssuedBooks] = React.useState<
    boolean | undefined
  >(false);
  const [canIssueBooks, setCanIssueBooks] = React.useState<
    boolean | undefined
  >(false);
  const [canModifyRenewals, setCanModifyRenewals] = React.useState<
    boolean | undefined
  >(false);
  const [canModifyLostBooks, setCanModifyLostBooks] = React.useState<
    boolean | undefined
  >(false);
  const [canModifyDamagedBooks, setCanModifyDamagedBooks] = React.useState<
    boolean | undefined
  >(false);
  const [canModifyArchive, setCanModifyArchive] = React.useState<
    boolean | undefined
  >(false);
  const [canSeeReports, setCanSeeReports] = React.useState<
    boolean | undefined
  >(false);

  const handleBack = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const adminMessage = 'All actions are enabled for this user.';
  const studentAssistantMessage =
    'This user can only approve and update borrow requests and message students.';
  const customMessage = 'Set custom actions for this user.';

  const handleModifyUser = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    nProgress.configure({ showSpinner: true });
    nProgress.start();

    const customPrivilegesObj = {
      modifyUser: false,
      modifyTerminatedUsers: false,
      modifyMasterList: false,
      modifyBook: false,
      canMessage: false,
      walkin: false,
      issued: false,
      borrow: false,
      renewal: false,
      lost: false,
      damaged: false,
      archive: false,
      reports: false,
    };

    try {
      const userRef = doc(db, 'users', selectedUser?.objectID);

      if (customPrivileges === false) {
        await updateDoc(userRef, {
          isAdmin: false,
          adminRole: deleteField(),
          adminPrivileges: customPrivilegesObj,
        });
        nProgress.done();
        setUpdating(false);
        toast.success('User privileges updated successfully.');
        return;
      }

      if (role === 'admin') {
        await updateDoc(userRef, {
          isAdmin: true,
          adminRole: role,
          adminPrivileges: {
            modifyUser: true,
            modifyTerminatedUsers: true,
            modifyMasterList: true,
            modifyBook: true,
            canMessage: true,
            walkin: true,
            issued: true,
            borrow: true,
            renewal: true,
            lost: true,
            damaged: true,
            archive: true,
            reports: true,
          },
        });
      }

      if (role === 'student assistant') {
        await updateDoc(userRef, {
          isAdmin: true,
          adminRole: role,
          adminPrivileges: {
            modifyUser: false,
            modifyTerminatedUsers: false,
            modifyMasterList: false,
            modifyBook: false,
            canMessage: true,
            walkin: true,
            issued: true,
            borrow: true,
            renewal: true,
            lost: true,
            damaged: true,
            archive: false,
            reports: false,
          },
        });
      }

      if (role === 'custom') {
        await updateDoc(userRef, {
          isAdmin: true,
          adminRole: role,
          adminPrivileges: {
            modifyUser: canModifyUsers,
            modifyTerminatedUsers: canModifyTerminatedUsers,
            modifyMasterList: canModifyMasters,
            modifyBook: canModifyBooks,
            canMessage: canMessageStudents,
            walkin: canIssueWalkin,
            issued: canModfiyIssuedBooks,
            borrow: canIssueBooks,
            renewal: canModifyRenewals,
            lost: canModifyLostBooks,
            damaged: canModifyDamagedBooks,
            archive: canModifyArchive,
            reports: canSeeReports,
          },
        });
      }

      nProgress.done();
      setUpdating(false);
      toast.success('User privileges updated successfully.');
    } catch (error) {
      nProgress.done();
      setUpdating(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={handleBack}
      contentLabel='Picked up Modal'
      style={modalCustomStyle}
      closeTimeoutMS={200}
    >
      <div className='space-y-4'>
        <div>Student name: {selectedUser?.displayName}</div>
        <button
          className='flex items-center space-x-2'
          type='button'
          onClick={() => {
            if (customPrivileges === false) {
              const newRole = selectedUser?.adminRole || 'admin';
              setRole(newRole);
              setCustomPrivileges(true);
            } else {
              setCustomPrivileges(false);
              setRole(undefined);
            }
          }}
        >
          <div
            className={`border-primary flex h-[20px] w-[20px] items-center justify-center rounded-sm border ${
              selectedUser?.isAdmin ? '' : ''
            }`}
          >
            {(selectedUser?.isAdmin || customPrivileges === true) && (
              <FaCheck />
            )}
          </div>
          <div>Enable Admin Privileges</div>
        </button>
        {(customPrivileges || selectedUser?.isAdmin) && (
          <div className='flex items-center space-x-3'>
            <button
              className='flex items-center space-x-2'
              type='button'
              onClick={() => {
                setRole('admin');
              }}
            >
              <div
                className="border-primary flex h-[20px] w-[20px] items-center justify-center rounded-sm border"
              >
                {(role === 'admin' ||
                  (selectedUser?.adminRole === 'admin' &&
                    role === undefined)) && <FaCheck />}
              </div>
              <div>Admin</div>
            </button>
            <button
              className='flex items-center space-x-2'
              type='button'
              onClick={() => {
                setRole('student assistant');
              }}
            >
              <div
                className="border-primary flex h-[20px] w-[20px] items-center justify-center rounded-sm border"
              >
                {(role === 'student assistant' ||
                  (selectedUser?.adminRole === 'student assistant' &&
                    role === undefined)) && <FaCheck />}
              </div>
              <div>Student assistant</div>
            </button>
            <button
              className='flex items-center space-x-2'
              type='button'
              onClick={() => {
                setRole('custom');
              }}
            >
              <div
                className="border-primary flex h-[20px] w-[20px] items-center justify-center rounded-sm border"
              >
                {(role === 'custom' ||
                  (selectedUser?.adminRole === 'custom' &&
                    role === undefined)) && <FaCheck />}
              </div>
              <div>Custom priviliges</div>
            </button>
          </div>
        )}
        {(customPrivileges || selectedUser?.isAdmin) && (
          <div className='text-red-600'>
            {role === 'admin'
              ? adminMessage
              : role === 'student assistant'
              ? studentAssistantMessage
              : customMessage}
          </div>
        )}
        <>
          {role === 'custom' && (
            <div className='space-y-1'>
              <PrivilegeComp
                text='Can access books'
                value={
                  canModifyBooks === undefined
                    ? selectedUser?.adminPrivileges?.modifyBook
                    : canModifyBooks
                }
                setValue={setCanModifyBooks}
              />
              <PrivilegeComp
                text='Can modify users'
                value={
                  canModifyUsers === undefined
                    ? selectedUser?.adminPrivileges?.modifyUser
                    : canModifyUsers
                }
                setValue={setCanModifyUsers}
              />
              <PrivilegeComp
                text="Can access master's list"
                value={
                  canModifyMasters === undefined
                    ? selectedUser?.adminPrivileges?.modifyMasterList
                    : canModifyMasters
                }
                setValue={setCanModifyMasters}
              />
              <PrivilegeComp
                text='Can access terminated users'
                value={
                  canModifyTerminatedUsers === undefined
                    ? selectedUser?.adminPrivileges?.modifyTerminatedUsers
                    : canModifyTerminatedUsers
                }
                setValue={setCanModifyTerminatedUsers}
              />
              {/*  */}
              <PrivilegeComp
                text='Can message students'
                value={
                  canMessageStudents === undefined
                    ? selectedUser?.adminPrivileges?.canMessage
                    : canMessageStudents
                }
                setValue={setCanMessageStudents}
              />
              <PrivilegeComp
                text='Can add walk-in issuance'
                value={
                  canIssueWalkin === undefined
                    ? selectedUser?.adminPrivileges?.walkin
                    : canIssueWalkin
                }
                setValue={setCanIssueWalkin}
              />
              <PrivilegeComp
                text='Can access issued books'
                value={
                  canModfiyIssuedBooks === undefined
                    ? selectedUser?.adminPrivileges?.issued
                    : canModfiyIssuedBooks
                }
                setValue={setCanModfiyIssuedBooks}
              />
              <PrivilegeComp
                text='Can access borrow requests'
                value={
                  canIssueBooks === undefined
                    ? selectedUser?.adminPrivileges?.borrow
                    : canIssueBooks
                }
                setValue={setCanIssueBooks}
              />
              <PrivilegeComp
                text='Can access renew requests'
                value={
                  canModifyRenewals === undefined
                    ? selectedUser?.adminPrivileges?.renewal
                    : canModifyRenewals
                }
                setValue={setCanModifyRenewals}
              />
              <PrivilegeComp
                text='Can access lost books'
                value={
                  canModifyLostBooks === undefined
                    ? selectedUser?.adminPrivileges?.lost
                    : canModifyLostBooks
                }
                setValue={setCanModifyLostBooks}
              />
              <PrivilegeComp
                text='Can access damaged books'
                value={
                  canModifyDamagedBooks === undefined
                    ? selectedUser?.adminPrivileges?.damaged
                    : canModifyDamagedBooks
                }
                setValue={setCanModifyDamagedBooks}
              />
              <PrivilegeComp
                text='Can access archived books'
                value={
                  canModifyArchive === undefined
                    ? selectedUser?.adminPrivileges?.archive
                    : canModifyArchive
                }
                setValue={setCanModifyArchive}
              />
              <PrivilegeComp
                text='Can access reports'
                value={
                  canSeeReports === undefined
                    ? selectedUser?.adminPrivileges?.reports
                    : canSeeReports
                }
                setValue={setCanSeeReports}
              />
            </div>
          )}
        </>
      </div>
      <button
        disabled={updating}
        type='button'
        className={`mt-[25px] rounded-lg px-3 py-2 text-white ${
          updating ? 'cursor-not-allowed bg-neutral-500' : 'bg-primary'
        }`}
        onClick={handleModifyUser}
      >
        {updating ? 'Updating...' : 'Update'}
      </button>
    </Modal>
  );
};

const Users = () => {
  const userSearchKey = useNextQuery(userSearchQueryName);
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [isModify, setIsModify] = React.useState(false);
  const [selectedUser, setSelectedUser] =
    React.useState<AlgoUserDoc | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_users, setUsers, refreshUsers, userLoading] =
    useAlgoData<AlgoUserDoc>('users', userSearchQueryName, userSearchKey);

  const users = React.useMemo(() => {
    return _users?.filter((user) => user.terminated !== true);
  }, [_users]);

  const [currentUsers, currentPage, next, prev] =
    useClientPagination<AlgoUserDoc>(users, ITEMS_PER_PAGE);

  const handleUpdate = () => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    refreshUsers();
    nProgress.done();
  };

  const handleRefresh = () => {
    router.push(
      {
        pathname: '/',
        query: {
          page: router.query.page,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleTerminate = async (userId: string) => {
    nProgress.configure({ showSpinner: true });
    nProgress.start();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        terminated: true,
      });

      const filteredUsers = users.filter(
        (userr) => userr.objectID !== userId
      );
      // const disabledUsers = users.find((user) => user.objectID === userId);
      console.log('filteredUsers', filteredUsers);
      setUsers(filteredUsers);

      toast.success('User terminated');
    } catch (error) {
      toast.error('Error terminating user');
    } finally {
      setLoading(false);
      nProgress.done();
    }
  };

  return (
    <section className='h-full w-full'>
      <ModifyUserModal
        isModalOpen={isModify}
        setIsModalOpen={setIsModify}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      {users && users.length > 0 && (
        <div className='mb-[10px] flex justify-between'>
          <div className='flex items-center space-x-2'>
            <button
              type='button'
              className='bg-primary rounded-md px-3 py-1 text-sm text-white duration-200 hover:bg-sky-800'
              onClick={handleUpdate}
            >
              Refresh records
            </button>
            <div className='text-sm'>Results: {users.length}</div>
          </div>
          {users.length / ITEMS_PER_PAGE > 1 && (
            <div className='flex items-center space-x-3'>
              <div>
                {currentPage}/{Math.ceil(users.length / ITEMS_PER_PAGE)}
              </div>
              <div className='space-x-1'>
                <button
                  type='button'
                  disabled={currentPage === 1}
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage === 1 && 'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => prev()}
                >
                  {'<'}
                </button>
                <button
                  type='button'
                  disabled={
                    currentPage ===
                    Math.ceil(users.length / ITEMS_PER_PAGE)
                  }
                  className={`text-textBlack rounded-md bg-neutral-200 px-[15px] text-xl ${
                    currentPage ===
                      Math.ceil(users.length / ITEMS_PER_PAGE) &&
                    'cursor-not-allowed opacity-40'
                  }`}
                  onClick={() => next()}
                >
                  {'>'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        style={{
          height: `calc(100% - ${users && users.length > 0 ? 30 : 0}px)`,
        }}
        className={`custom-scrollbar w-full ${
          users && users.length > 0 && 'overflow-y-scroll'
        }`}
      >
        {!userLoading && (!users || (users && users.length === 0)) && (
          <div className='flex h-full w-full flex-col justify-center space-y-3'>
            <div className='relative mx-auto h-[75%] w-[75%]'>
              <Image
                src='/assets/images/empty.png'
                layout='fill'
                objectFit='contain'
                blurDataURL='/assets/images/empty.png'
                placeholder='blur'
                quality={50}
              />
            </div>
            <h1 className='text-cGray-300 text-center text-2xl'>
              {userSearchKey
                ? 'No users found'
                : 'There is currently no registered users.'}
            </h1>
            <button
              type='button'
              onClick={handleRefresh}
              className='text-xl text-sky-600'
            >
              Refresh
            </button>
          </div>
        )}
        {users && users.length > 0 && (
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                {userTableHeaders.map((header) => (
                  <th
                    key={header}
                    className='bg-primary truncate border-b-2 border-gray-200 px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-white'
                  >
                    {' '}
                    {header}{' '}
                  </th>
                ))}
                <th
                  className='bg-primary border-b-2 border-gray-200 px-5 py-5 '
                  aria-label='action'
                />
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => {
                return (
                  <React.Fragment key={user.objectID}>
                    <ReactTooltip id={user.objectID} />

                    <tr key={user.objectID} className='font-medium'>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div className='relative h-[40px] w-[40px] overflow-hidden rounded-full'>
                          <Image
                            src={user.photo.url}
                            layout='fill'
                            quality={10}
                          />
                        </div>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button type='button'>
                          <p className='line-clamp-2 text-primary max-w-[210px] overflow-hidden text-left'>
                            {user.displayName}
                          </p>
                        </button>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <button
                          className='flex items-center space-x-1'
                          type='button'
                          onClick={() => {
                            copyToClipboard(user.email);
                            toast.success('Email copied to clipboard');
                          }}
                        >
                          <p
                            data-for={user.objectID}
                            data-tip={user.email}
                            className='line-clamp-2 overflow-hidden text-left text-neutral-900'
                          >
                            {user.email.replace('@alabang.sti.edu.ph', '')}
                          </p>
                          <AiOutlineCopy className='text-lg text-sky-600' />
                        </button>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalBorrowedBooks}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalRenewedBooks}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalReturnedBooks}
                        </p>
                      </td>

                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <p className='line-clamp-2 max-w-[210px] overflow-hidden text-left text-neutral-900'>
                          {user.totalLostBooks}
                        </p>
                      </td>
                      <td className='border-cGray-200 border-b bg-white px-5 py-5 text-sm'>
                        <div className='flex flex-col space-y-2'>
                          <button
                            type='button'
                            className='truncate rounded-md bg-sky-600 px-2 py-1 text-xs text-white'
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModify(true);
                            }}
                          >
                            Modify
                          </button>
                          <button
                            type='button'
                            disabled={loading}
                            className='truncate rounded-md bg-red-600 px-2 py-1 text-xs text-white'
                            onClick={() => {
                              handleTerminate(user.objectID);
                            }}
                          >
                            Terminate
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Users;
