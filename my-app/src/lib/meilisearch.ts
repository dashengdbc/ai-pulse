import { Meilisearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '';

const globalForMeili = globalThis as unknown as {
  meiliSearch: Meilisearch | undefined;
};

export const meiliSearch =
  globalForMeili.meiliSearch ??
  new Meilisearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_API_KEY,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForMeili.meiliSearch = meiliSearch;
}

export const CONTENT_INDEX = 'contents';

export async function initializeIndexes(): Promise<void> {
  try {
    const index = meiliSearch.index(CONTENT_INDEX);
    
    await index.updateSettings({
      searchableAttributes: [
        'translatedTitle',
        'translatedAbstract',
        'originalTitle',
        'originalAbstract',
        'tags',
        'author',
      ],
      filterableAttributes: [
        'category',
        'originalLanguage',
        'sourceId',
        'publishedAt',
        'tags',
      ],
      sortableAttributes: ['publishedAt', 'createdAt', 'updatedAt'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
    });

    console.log('Meilisearch indexes initialized');
  } catch (error) {
    console.error('Failed to initialize Meilisearch:', error);
  }
}

export default meiliSearch;
