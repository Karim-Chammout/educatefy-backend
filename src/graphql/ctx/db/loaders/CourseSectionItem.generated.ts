// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `CourseSectionItem.ts` in this directory
// and extend `CourseSectionItemBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseSectionItem as CourseSectionItemType } from '../../../../types/db-generated-types';
import { mapTo, mapToMany } from './map';

export class CourseSectionItemBase {
  private byIdLoader: DataLoader<number, CourseSectionItemType>;

  private byCourseSectionIdLoader: DataLoader<number, ReadonlyArray<CourseSectionItemType>>;

  private byContentIdLoader: DataLoader<number, ReadonlyArray<CourseSectionItemType>>;

  loadAll: () => Promise<ReadonlyArray<CourseSectionItemType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db
        .table('course_section_item')
        .whereIn('id', ids)
        .whereNull('deleted_at')
        .select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byCourseSectionIdLoader = new DataLoader(async (courseSectionIds) => {
      if (courseSectionIds.length === 0) return [];

      const rows = await db
        .table('course_section_item')
        .whereIn('course_section_id', courseSectionIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(courseSectionIds, rows, (r) => r.course_section_id);
    });

    this.byContentIdLoader = new DataLoader(async (contentIds) => {
      if (contentIds.length === 0) return [];

      const rows = await db
        .table('course_section_item')
        .whereIn('content_id', contentIds)
        .whereNull('deleted_at')
        .select();

      return mapToMany(contentIds, rows, (r) => r.content_id);
    });

    this.loadAll = async () => {
      const result = await db.table('course_section_item').whereNull('deleted_at').select();

      for (const row of result) {
        this.byIdLoader.prime(row.id, row);
      }

      return result;
    };
  }

  /**
   * Exposes the underlying DataLoader instances so callers can prime or
   * clear the cache directly when needed.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byCourseSectionIdLoader: this.byCourseSectionIdLoader,
      byContentIdLoader: this.byContentIdLoader,
    };
  }

  /** Load a single CourseSectionItem by its primary key */
  loadById(id: number): Promise<CourseSectionItemType> {
    return this.byIdLoader.load(id);
  }

  /** Load many CourseSectionItem records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseSectionItemType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all CourseSectionItem records with course_section_id = `courseSectionId` */
  loadByCourseSectionId(courseSectionId: number): Promise<ReadonlyArray<CourseSectionItemType>> {
    return this.byCourseSectionIdLoader.load(courseSectionId);
  }

  /** Load all CourseSectionItem records with content_id = `contentId` */
  loadByContentId(contentId: number): Promise<ReadonlyArray<CourseSectionItemType>> {
    return this.byContentIdLoader.load(contentId);
  }
}
