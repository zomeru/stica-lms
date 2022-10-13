import { useMemo, useState } from 'react';

/**
 *
 * @param data the query key
 * @param itemsPerPage the number of items per page
 * @returns [items, currentPage, next, prev]
 */
const useClientPagination = <T>(data: T[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = useMemo(
    () => currentPage * itemsPerPage,
    [currentPage]
  );
  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - itemsPerPage,
    [indexOfLastItem]
  );

  const items = useMemo(
    () => data.slice(indexOfFirstItem, indexOfLastItem),
    [data, indexOfFirstItem, indexOfLastItem]
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

  return [items, currentPage, next, prev] as const;
};

export default useClientPagination;
