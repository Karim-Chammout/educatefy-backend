import DataLoader from 'dataloader';
import { Knex } from 'knex';

import { ProgramObjective as ProgramObjectiveType } from '../../../../types/db-generated-types';

export class ProgramObjectiveReader {
  private byIdLoader: DataLoader<number, ProgramObjectiveType>;

  private byProgramIdLoader: DataLoader<number, ReadonlyArray<ProgramObjectiveType>>;

  /**
   * Load all entities from the database.
   */
  loadAll: () => Promise<ReadonlyArray<ProgramObjectiveType>>;

  constructor(db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) {
        return [];
      }
      const rows = await db
        .table('program_objective')
        .whereIn('id', ids)
        .select()
        .then((results) => ids.map((id) => results.find((x) => x.id === id)));

      return rows;
    });

    this.byProgramIdLoader = new DataLoader(async (programIds) => {
      if (programIds.length === 0) {
        return [];
      }
      const rows = await db
        .table('program_objective')
        .whereIn('program_id', programIds)
        .select()
        .then((results) =>
          programIds.map((programId) => results.filter((x) => x.program_id === programId)),
        );

      return rows;
    });

    this.loadAll = async () => {
      const result = await db.table('program_objective').select();

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
      byProgramIdLoader: this.byProgramIdLoader,
    };
  }

  /** Load entities with the matching primary key */
  loadById(id: number): Promise<ProgramObjectiveType> {
    return this.byIdLoader.load(id);
  }

  /** Load entities with the matching primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<ProgramObjectiveType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  loadByProgramId(programIds: number): Promise<ReadonlyArray<ProgramObjectiveType>> {
    return this.byProgramIdLoader.load(programIds);
  }
}
