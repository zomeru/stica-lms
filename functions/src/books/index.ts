import { db, regionalFunctions, storage } from '..';

// Delete the image from storage
export const onBookDelete = regionalFunctions.firestore
  .document('books/{booksId}')
  .onDelete(async (snap) => {
    const book = snap.data();
    const imageRef = book?.imageCover?.ref;
  });
