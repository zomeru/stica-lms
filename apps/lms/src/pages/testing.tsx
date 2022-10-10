import React from 'react';
import { collection, doc, updateDoc } from 'firebase/firestore';

import { useCol } from '@src/services';
import { db } from '@lms/db';

const Testing = () => {
  const [testData] = useCol<any>(collection(db, 'test'));

  console.log('testData', testData);

  const updateTestData = async () => {
    if (!testData) return;

    const docRef = doc(db, 'test', testData[0].id);

    // testData structure
    // {
    //   id: 'testId',
    //   str: 'some string',
    //   someArr: [
    //     {
    //       available: true,
    //       isbn: '123'
    //     }
    //   ]
    // }

    // get item where isnb === '123'
    const item = testData[0].someArr.find((el: any) => el.isbn === '123');

    // get new arr without item
    const newArr = testData[0].someArr.filter(
      (el: any) => el.isbn !== '123'
    );

    const newSomeArr = [
      ...newArr,
      {
        isbn: item.isbn,
        available: true,
      },
    ];

    await updateDoc(docRef, {
      someArr: newSomeArr,
    });

    console.log('updated');
  };

  return (
    <div>
      <button type='button' onClick={updateTestData}>
        Update
      </button>
    </div>
  );
};

export default Testing;
