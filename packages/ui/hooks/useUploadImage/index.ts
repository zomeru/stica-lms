import { useState } from 'react';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';

import { storage } from '@lms/db';

const keyGen = (diff?: string | number) => {
  return Math.trunc(
    Number(`${diff || ''}${Date.now() + Math.random() * 100000}`)
  ).toString();
};

const useUploadImage = () => {
  const [uploadError, setUploadError] = useState<string>(
    null as unknown as string
  );

  const uploadImage = async (storagePath: string, file: File) => {
    try {
      setUploadError(null as unknown as string);

      if (file) {
        const imageRef = `${storagePath}/${keyGen()}-${file.name}`;
        const storageRef = ref(storage, imageRef);
        const image = await uploadBytes(storageRef, file);

        const imageUrl = await getDownloadURL(
          ref(storage, image?.ref.fullPath)
        );

        const imageCover = {
          url: imageUrl,
          ref: imageRef,
        };

        if (image?.ref.fullPath) return imageCover;
      }

      return null;
    } catch (error: any) {
      console.log('error uploading image', error);
      setUploadError(error.message);
      return null;
    }
  };

  return { uploadImage, uploadError };
};

export default useUploadImage;
