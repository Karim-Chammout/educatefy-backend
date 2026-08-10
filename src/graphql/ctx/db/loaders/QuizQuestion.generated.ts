// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `QuizQuestion.ts` in this directory
// and extend `QuizQuestionBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { QuizQuestion as QuizQuestionType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class QuizQuestionBase {
  private byIdLoader: DataLoader<number, QuizQuestionType>;

  private byQuizIdLoader: DataLoader<number, ReadonlyArray<QuizQuestionType>>;

  loadAll: () => Promise<ReadonlyArray<QuizQuestionType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('quiz_question').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byQuizIdLoader = new DataLoader(async (quizIds) => {
      if (quizIds.length === 0) return [];

      const rows = await db.table('quiz_question').whereIn('quiz_id', quizIds).select();

      return mapToMany(quizIds, rows, (r) => r.quiz_id);
    });

    this.loadAll = async () => {
      const result = await db.table('quiz_question').select();

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
      byQuizIdLoader: this.byQuizIdLoader,
    };
  }

  /** Load a single QuizQuestion by its primary key */
  loadById(id: number): Promise<QuizQuestionType> {
    return this.byIdLoader.load(id);
  }

  /** Load many QuizQuestion records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<QuizQuestionType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all QuizQuestion records with quiz_id = `quizId` */
  loadByQuizId(quizId: number): Promise<ReadonlyArray<QuizQuestionType>> {
    return this.byQuizIdLoader.load(quizId);
  }
}
