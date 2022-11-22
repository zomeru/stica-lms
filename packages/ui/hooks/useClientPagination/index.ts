import { useMemo, useState } from 'react';

type FunctionType = () => void;
type PaginationReturnType<S> = [S[], number, FunctionType, FunctionType];
type Sorter = {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

/**
 *
 * @param data the query key
 * @param itemsPerPage the number of items per page
 * @param sorter {sortBy: string, sortOrder: 'asc' | 'desc'} the sorter object
 * @param customCurrentPage custom current page, if provided, next and prev functions will not work
 * @returns [items, currentPage, next, prev]
 */
export const useClientPagination = <T>(
  data: T[],
  itemsPerPage: number,
  sorter?: Sorter,
  customCurrentPage?: number
): PaginationReturnType<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = useMemo(
    () => (customCurrentPage || currentPage) * itemsPerPage,
    [customCurrentPage, currentPage, itemsPerPage]
  );
  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - itemsPerPage,
    [indexOfLastItem, itemsPerPage]
  );

  const items = useMemo(
    () =>
      (sorter
        ? [...data].sort((a, b) => {
            const sortBy = sorter.sortBy;
            const sortOrder = sorter.sortOrder;

            const newA = a[sortBy as keyof T];
            const newB = b[sortBy as keyof T];

            const newAa =
              typeof newA === 'string' ? newA.toLowerCase() : newA;
            const newBb =
              typeof newB === 'string' ? newB.toLowerCase() : newB;

            if (newAa > newBb) return sortOrder === 'desc' ? -1 : 1;
            if (newAa < newBb) return sortOrder === 'desc' ? 1 : -1;
            return 0;
          })
        : data
      ).slice(indexOfFirstItem, indexOfLastItem),
    [data, indexOfFirstItem, indexOfLastItem, sorter]
  );

  const next = () => {
    if (data && currentPage === Math.ceil(data.length / itemsPerPage))
      return;

    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prev = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const returnArray: PaginationReturnType<T> = [
    items,
    currentPage,
    next,
    prev,
  ];

  return returnArray;
};
