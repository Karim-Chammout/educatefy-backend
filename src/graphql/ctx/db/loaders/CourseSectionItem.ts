import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { CourseSectionItem as CourseSectionItemType } from '../../../../types/db-generated-types';

export class CourseSectionItemReader {
  private byIdLoader: DataLoader<number, CourseSectionItemType>;

  private byCourseSectionIdLoader: DataLoader<number, ReadonlyArray<CourseSectionItemType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<CourseSectionItemType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('course_section_item')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byCourseSectionIdLoader = new DataLoader(async (courseSectionIds) => {
      if (courseSectionIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('course_section_item')
        .whereIn('course_section_id', courseSectionIds)
        .select()
        .then((results) =>
          courseSectionIds.map((courseSectionId) =>
            results.filter((x) => x.course_section_id === courseSectionId),
          ),
        );

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('course_section_item').select();

      for (const row of result) {
        this.byIdLoader.prime(row.id, row);
      }
      return result;
    };
  }

  /**
   * This property exposes the private loaders in order to prime or clear the cache of the loader.
   */
  get loaders() {
    return {
      byIdLoader: this.byIdLoader,
      byCourseSectionIdLoader: this.byCourseSectionIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<CourseSectionItemType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<CourseSectionItemType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByCourseSectionId(courseSectionIds: number): Promise<ReadonlyArray<CourseSectionItemType>> {
    return this.byCourseSectionIdLoader.load(courseSectionIds);
  }
}
