import { useEffect, useState } from 'react';
import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY as string
);

/**
 *
 * @param index index of the algolia
 * @param searchKeyword the keyword to search
 * @returns [data, setData, refreshData, loading]
 */
export const useAlgoData = <T>(index: string, searchKeyword?: string) => {
  const searchIndex = searchClient.initIndex(index);

  const [algoData, setAlgoData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const [value, setValue] = useState(0);

  useEffect(() => {
    const getAlgoData = async () => {
      setLoading(true);
      if (!searchKeyword) {
        let hits: T[] = [];

        await searchIndex
          .browseObjects({
            batch: (batch) => {
              hits = hits.concat(batch as T[]);
            },
          })
          .then(() => {
            setAlgoData(hits);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching data', err);
            setLoading(false);
          });
      }

      if (searchKeyword) {
        const result = await searchIndex.search(searchKeyword || '');

        if (result.hits) {
          setAlgoData(result.hits as T[]);
        }

        setLoading(false);
      }
    };

    getAlgoData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, value]);

  const refreshData = () => setValue((value) => value + 1);

  return [algoData, setAlgoData, refreshData, loading] as const;
};
