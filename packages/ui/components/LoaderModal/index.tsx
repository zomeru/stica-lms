import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#__next');

const modalCustomStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    backgroundColor: 'transparent',
    border: 'none',
  },
};
export const LoaderModal = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <Modal
      isOpen={isLoading}
      style={modalCustomStyle}
      contentLabel='Loader Modal'
    >
      <div
        className='h-12 w-12 animate-spin rounded-full
      border-8 border-solid border-primary border-t-transparent'
      />
    </Modal>
  );
};
