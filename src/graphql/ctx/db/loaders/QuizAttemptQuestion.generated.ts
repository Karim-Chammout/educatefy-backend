// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `QuizAttemptQuestion.ts` in this directory
// and extend `QuizAttemptQuestionBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { QuizAttemptQuestion as QuizAttemptQuestionType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class QuizAttemptQuestionBase {
  private byIdLoader: DataLoader<number, QuizAttemptQuestionType>;

  private byAttemptIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptQuestionType>>;

  private byQuestionIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptQuestionType>>;

  loadAll: () => Promise<ReadonlyArray<QuizAttemptQuestionType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('quiz_attempt_question').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAttemptIdLoader = new DataLoader(async (attemptIds) => {
      if (attemptIds.length === 0) return [];

      const rows = await db
        .table('quiz_attempt_question')
        .whereIn('attempt_id', attemptIds)
        .select();

      return mapToMany(attemptIds, rows, (r) => r.attempt_id);
    });

    this.byQuestionIdLoader = new DataLoader(async (questionIds) => {
      if (questionIds.length === 0) return [];

      const rows = await db
        .table('quiz_attempt_question')
        .whereIn('question_id', questionIds)
        .select();

      return mapToMany(questionIds, rows, (r) => r.question_id);
    });

    this.loadAll = async () => {
      const result = await db.table('quiz_attempt_question').select();

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
      byAttemptIdLoader: this.byAttemptIdLoader,
      byQuestionIdLoader: this.byQuestionIdLoader,
    };
  }

  /** Load a single QuizAttemptQuestion by its primary key */
  loadById(id: number): Promise<QuizAttemptQuestionType> {
    return this.byIdLoader.load(id);
  }

  /** Load many QuizAttemptQuestion records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<QuizAttemptQuestionType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all QuizAttemptQuestion records with attempt_id = `attemptId` */
  loadByAttemptId(attemptId: number): Promise<ReadonlyArray<QuizAttemptQuestionType>> {
    return this.byAttemptIdLoader.load(attemptId);
  }

  /** Load all QuizAttemptQuestion records with question_id = `questionId` */
  loadByQuestionId(questionId: number): Promise<ReadonlyArray<QuizAttemptQuestionType>> {
    return this.byQuestionIdLoader.load(questionId);
  }
}
