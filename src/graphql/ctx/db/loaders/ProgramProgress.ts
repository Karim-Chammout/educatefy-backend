import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ProgramProgress as ProgramProgressType } from '../../../../types/db-generated-types';

export class ProgramProgressReader {
  private byIdLoader: DataLoader<number, ProgramProgressType>;

  private byAccountProgramIdLoader: DataLoader<number, ProgramProgressType>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<ProgramProgressType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('program_progress')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byAccountProgramIdLoader = new DataLoader(async (accountProgramIds) => {
      if (accountProgramIds.length === 0) {
        return [];
      }

      const rows = await db
        .table('program_progress')
        .whereIn('account__program_id', accountProgramIds)
        .select()
        .then((results) =>
          accountProgramIds.map((id) => results.find((x) => x.account__program_id === id)),
        );

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('program_progress').select();

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
      byAccountProgramIdLoader: this.byAccountProgramIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<ProgramProgressType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramProgressType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByAccountProgramId(accountProgramId: number): Promise<ProgramProgressType> {
    return this.byAccountProgramIdLoader.load(accountProgramId);
  }
}
