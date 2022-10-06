/* eslint-disable */
import { ChangeEventHandler, useState, useEffect } from 'react';
import useCompressImage from '../useCompressImage';

const useFileHandler = () => {
  const [file, setFile] = useState<File>(null as unknown as File);
  const [image, setImage] = useState<string>('');

  const fileHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    let accepted: File = null as unknown as File;

    if (file) {
      if (file.size > 300000) {
        if (file.type.startsWith('image/')) {
          const compressed = await useCompressImage(file);
          accepted = compressed;
        }
      } else {
        accepted = file;
      }
    }

    setFile(accepted);
  };

  const clearFile = () => {
    setFile(null as unknown as File);
    setImage('');
  };

  useEffect(() => {
    if (file) {
      const parsedImage = URL.createObjectURL(file);
      setImage(parsedImage);
    }
  }, [file]);

  return [fileHandler, file, image, clearFile] as const;
};

export default useFileHandler;
