/* eslint-disable no-unused-vars */
import Compressor from 'compressorjs';

export type Options = Omit<Compressor.Options, 'success' | 'error'>;
export type CompressFunction = (
  file: File,
  options?: Options | undefined
) => Promise<File>;

const useCompressImage: CompressFunction = (
  file,
  options = {
    mimeType: 'image/jpeg',
    quality: 0.7,
    convertSize: 8 * 1024 * 1024,
  }
) => {
  const isImage = file.type.startsWith('image/') || file.type === '';
  // if not image, return original file
  if (!isImage) {
    return Promise.resolve(file);
  }

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    // eslint-disable-next-line no-new
    new Compressor(file, {
      quality: 0.5,
      success: (result) => {
        let newFile: File;
        if (result instanceof Blob) {
          newFile = new File([result], file.name, {
            type: file.type,
          });
        } else {
          newFile = result;
        }

        resolve(newFile);
      },
      error(err) {
        reject(err);
      },
      ...options,
    });
  });
};

export default useCompressImage;
