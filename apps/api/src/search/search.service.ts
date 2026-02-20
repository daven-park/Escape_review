import { BadRequestException, Injectable } from '@nestjs/common';

import {
  SearchRepository,
  SearchStoreEntity,
  SearchThemeEntity,
} from './search.repository';

const SEARCH_TYPES = ['theme', 'store', 'all'] as const;
const DEFAULT_LIMIT = 20;

export type SearchType = (typeof SEARCH_TYPES)[number];

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(query: string, type: SearchType = 'all') {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new BadRequestException('q is required');
    }

    if (!SEARCH_TYPES.includes(type)) {
      throw new BadRequestException('type must be one of: theme, store, all');
    }

    let themes: SearchThemeEntity[] = [];
    let stores: SearchStoreEntity[] = [];

    if (type === 'all') {
      [themes, stores] = await Promise.all([
        this.searchRepository.searchThemes(normalizedQuery, DEFAULT_LIMIT),
        this.searchRepository.searchStores(normalizedQuery, DEFAULT_LIMIT),
      ]);
    } else if (type === 'theme') {
      themes = await this.searchRepository.searchThemes(normalizedQuery, DEFAULT_LIMIT);
    } else {
      stores = await this.searchRepository.searchStores(normalizedQuery, DEFAULT_LIMIT);
    }

    return {
      data: {
        themes,
        stores,
      },
      meta: {
        q: normalizedQuery,
        type,
      },
      error: null,
    };
  }
}
