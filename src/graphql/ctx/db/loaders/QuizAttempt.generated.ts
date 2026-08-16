// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `QuizAttempt.ts` in this directory
// and extend `QuizAttemptBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { QuizAttempt as QuizAttemptType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class QuizAttemptBase {
  private byIdLoader: DataLoader<number, QuizAttemptType>;

  private byAccountIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptType>>;

  private byEnrollmentIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptType>>;

  private byQuizIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptType>>;

  loadAll: () => Promise<ReadonlyArray<QuizAttemptType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('quiz_attempt').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAccountIdLoader = new DataLoader(async (accountIds) => {
      if (accountIds.length === 0) return [];

      const rows = await db.table('quiz_attempt').whereIn('account_id', accountIds).select();

      return mapToMany(accountIds, rows, (r) => r.account_id);
    });

    this.byEnrollmentIdLoader = new DataLoader(async (enrollmentIds) => {
      if (enrollmentIds.length === 0) return [];

      const rows = await db.table('quiz_attempt').whereIn('enrollment_id', enrollmentIds).select();

      return mapToMany(enrollmentIds, rows, (r) => r.enrollment_id);
    });

    this.byQuizIdLoader = new DataLoader(async (quizIds) => {
      if (quizIds.length === 0) return [];

      const rows = await db.table('quiz_attempt').whereIn('quiz_id', quizIds).select();

      return mapToMany(quizIds, rows, (r) => r.quiz_id);
    });

    this.loadAll = async () => {
      const result = await db.table('quiz_attempt').select();

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
      byAccountIdLoader: this.byAccountIdLoader,
      byEnrollmentIdLoader: this.byEnrollmentIdLoader,
      byQuizIdLoader: this.byQuizIdLoader,
    };
  }

  /** Load a single QuizAttempt by its primary key */
  loadById(id: number): Promise<QuizAttemptType> {
    return this.byIdLoader.load(id);
  }

  /** Load many QuizAttempt records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<QuizAttemptType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all QuizAttempt records with account_id = `accountId` */
  loadByAccountId(accountId: number): Promise<ReadonlyArray<QuizAttemptType>> {
    return this.byAccountIdLoader.load(accountId);
  }

  /** Load all QuizAttempt records with enrollment_id = `enrollmentId` */
  loadByEnrollmentId(enrollmentId: number): Promise<ReadonlyArray<QuizAttemptType>> {
    return this.byEnrollmentIdLoader.load(enrollmentId);
  }

  /** Load all QuizAttempt records with quiz_id = `quizId` */
  loadByQuizId(quizId: number): Promise<ReadonlyArray<QuizAttemptType>> {
    return this.byQuizIdLoader.load(quizId);
  }
}
