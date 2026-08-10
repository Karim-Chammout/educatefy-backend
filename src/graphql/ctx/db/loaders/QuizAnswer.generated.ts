// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `QuizAnswer.ts` in this directory
// and extend `QuizAnswerBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { QuizAnswer as QuizAnswerType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class QuizAnswerBase {
  private byIdLoader: DataLoader<number, QuizAnswerType>;

  private byQuestionIdLoader: DataLoader<number, ReadonlyArray<QuizAnswerType>>;

  loadAll: () => Promise<ReadonlyArray<QuizAnswerType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('quiz_answer').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byQuestionIdLoader = new DataLoader(async (questionIds) => {
      if (questionIds.length === 0) return [];

      const rows = await db.table('quiz_answer').whereIn('question_id', questionIds).select();

      return mapToMany(questionIds, rows, (r) => r.question_id);
    });

    this.loadAll = async () => {
      const result = await db.table('quiz_answer').select();

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
      byQuestionIdLoader: this.byQuestionIdLoader,
    };
  }

  /** Load a single QuizAnswer by its primary key */
  loadById(id: number): Promise<QuizAnswerType> {
    return this.byIdLoader.load(id);
  }

  /** Load many QuizAnswer records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<QuizAnswerType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all QuizAnswer records with question_id = `questionId` */
  loadByQuestionId(questionId: number): Promise<ReadonlyArray<QuizAnswerType>> {
    return this.byQuestionIdLoader.load(questionId);
  }
}
