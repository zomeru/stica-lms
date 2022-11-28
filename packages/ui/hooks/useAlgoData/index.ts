import { useEffect, useState } from 'react';
import algoliasearch from 'algoliasearch';
import { useRouter } from 'next/router';

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
export const useAlgoData = <T>(
  index: string,
  searchQuery: string,
  searchKeyword?: string
) => {
  const searchIndex = searchClient.initIndex(index);
  const router = useRouter();

  const [algoData, setAlgoData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  // const [firstFetch, setFirstFetch] = useState(false);

  const [value, setValue] = useState(0);

  useEffect(() => {
    const getAlgoData = async () => {
      setLoading(true);
      if (!searchKeyword) {
        let hits: T[] = [];

        await searchIndex
          .browseObjects({
            batch: (batch) => {
              hits = hits.concat(batch as unknown as T[]);
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
        const result = await searchIndex.search(searchKeyword);

        if (result.hits) {
          const hits = [...(result.hits as unknown as T[])];
          setAlgoData(hits);
        }

        setLoading(false);
      }

      // setFirstFetch(true);
    };

    // if (!firstFetch) {
    //   getAlgoData();
    // }

    getAlgoData();

    // automatically update data every 1 minute
    const interval = setInterval(() => {
      getAlgoData();
    }, 1000 * 60);

    return () => {
      clearInterval(interval);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, value]);

  const refreshData = () => {
    setValue((value) => value + 1);

    const allQueries: any = {
      ...router.query,
    };

    if (allQueries.hasOwnProperty(searchQuery)) {
      delete allQueries[searchQuery];
    }

    router.push(
      {
        pathname: '/',
        query: allQueries,
      },
      undefined,
      { shallow: true }
    );
  };

  return [algoData, setAlgoData, refreshData, loading] as const;
};
