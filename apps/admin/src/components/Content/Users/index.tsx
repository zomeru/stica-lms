import React, { useState, useEffect } from 'react';
import algoliasearch from 'algoliasearch';
import { collection, query } from 'firebase/firestore';

import { useCol } from '@src/services';
import { db } from '@lms/db';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY as string
);

const searchIndex = searchClient.initIndex('users');

const Users = () => {
  const [algoUsers, setAlgoUsers] = useState<any[]>([]);

  const [users] = useCol(query(collection(db, 'users')));

  console.log('users', users);
  console.log('algoUsers', algoUsers);

  useEffect(() => {
    const getUsers = async () => {
      let hits: any[] = [];

      await searchIndex
        .browseObjects({
          batch: (batch) => {
            hits = hits.concat(batch);
          },
        })
        .then(() => {
          setAlgoUsers(hits);
        })
        .catch((err) => {
          console.error('Error fetching users', err);
        });
    };

    getUsers();
  }, []);

  return <div>Users</div>;
};

export default Users;
