import { useRouter } from 'next/router';
import { useMemo } from 'react';

/**
 *
 * @param key the query key
 * @returns the query value to the query key
 */
const useNextQuery = (key: string): string | undefined => {
  const { query } = useRouter();

  const value = useMemo(() => {
    if (!query[key]) return undefined;

    return decodeURIComponent(query[key] as string);
  }, [query, key]);

  return value;
};

export default useNextQuery;
