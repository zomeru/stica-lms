import { useMemo } from 'react';

const useClientPagination = <T>(
  data: T[],
  itemsPerPage: number,
  currentPage: number
) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - itemsPerPage,
    [indexOfLastItem]
  );

  const currentItems = useMemo(
    () => data.slice(indexOfFirstItem, indexOfLastItem),
    [data, indexOfFirstItem, indexOfLastItem]
  );

  return currentItems;
};

export default useClientPagination;
