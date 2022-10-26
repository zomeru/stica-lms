import { useEffect, useState } from 'react';
import {
  // getRedirectResult,
  // OAuthProvider,
  // onAuthStateChanged,
  // signInWithRedirect,
  signOut,
} from 'firebase/auth';
// import { auth, db } from '@lms/db';
import { auth } from '@lms/db';

import { useAuth } from '@src/contexts';

const Testing = () => {
  const { user } = useAuth();
  const [added, setAdded] = useState(false);

  console.log('user', user);

  useEffect(() => {
    // const fictionCategoryId = '474tkYUorS6UCk7hnWl9';
    // const nonFictionCategoryId = 'thM9VL0LdW3Kja4Konrc';

    // const genreCol = collection(db, 'genres');

    const saveGenres = async () => {
      // BOOK_GENRES_FICTION.forEach(async (genre) => {
      //   try {
      //     await addDoc(genreCol, {
      //       genre,
      //       categoryId: fictionCategoryId,
      //     });
      //     console.log('fiction genre added');
      //   } catch (error) {
      //     console.log('error adding fiction genre', error);
      //   }
      // });

      //   BOOK_GENRES_NONFICTION.forEach(async (genre) => {
      //     try {
      //       await addDoc(genreCol, {
      //         genre,
      //         categoryId: nonFictionCategoryId,
      //       });
      //       console.log('non fiction genre added');
      //     } catch (error) {
      //       console.log('error adding non fiction genre', error);
      //     }
      //   });

      console.log('added all');
      setAdded(true);
    };

    if (user && !added) {
      saveGenres();
    }

    // onAuthStateChanged(auth, async (currentUser) => {
    //   console.log('currentUser', currentUser);
    // });
    // getRedirectResult(auth)
    //   .then((result) => {
    //     console.log('result', result);
    //     if (result) {
    //       const credential = OAuthProvider.credentialFromResult(result);
    //       console.log('credential', credential);
    //     }
    //   })
    //   .catch((error) => {
    //     // Handle error.
    //     console.log('error', error);
    //   });
  }, [user, added]);

  const handleLogin = () => {
    // const provider = new OAuthProvider('microsoft.com');
    // provider.setCustomParameters({
    //   prompt: 'select_account',
    //   tenant: process.env.NEXT_PUBLIC_AZURE_STICA_TENANT_ID!,
    //   // redirect_uri: '/testing',
    // });
    // provider.addScope('user.read');
    // signInWithRedirect(auth, provider);
  };
  return (
    <div>
      <button type='button' onClick={handleLogin}>
        Sign in
      </button>
      <button type='button' onClick={() => signOut(auth)}>
        Sign out
      </button>
    </div>
  );
};

export default Testing;
