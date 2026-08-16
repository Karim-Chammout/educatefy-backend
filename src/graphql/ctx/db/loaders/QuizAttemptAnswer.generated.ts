// ⚠️  This file is auto-generated. Do NOT edit it manually.
// To add custom loaders, create `QuizAttemptAnswer.ts` in this directory
// and extend `QuizAttemptAnswerBase`. The generator will never overwrite that file.
// Re-run `npm run generate-loaders` to refresh this file.

import DataLoader from 'dataloader';
import type { Knex } from 'knex';

import { QuizAttemptAnswer as QuizAttemptAnswerType } from '../../../../types/db-generated-types.js';
import { mapTo, mapToMany } from './map.js';

export class QuizAttemptAnswerBase {
  private byIdLoader: DataLoader<number, QuizAttemptAnswerType>;

  private byAttemptIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptAnswerType>>;

  private byAttemptQuestionIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptAnswerType>>;

  private byAnswerIdLoader: DataLoader<number, ReadonlyArray<QuizAttemptAnswerType>>;

  loadAll: () => Promise<ReadonlyArray<QuizAttemptAnswerType>>;

  constructor(protected db: Knex) {
    this.byIdLoader = new DataLoader(async (ids) => {
      if (ids.length === 0) return [];

      const rows = await db.table('quiz_attempt_answer').whereIn('id', ids).select();

      return mapTo(ids, rows, (r) => r.id);
    });

    this.byAttemptIdLoader = new DataLoader(async (attemptIds) => {
      if (attemptIds.length === 0) return [];

      const rows = await db.table('quiz_attempt_answer').whereIn('attempt_id', attemptIds).select();

      return mapToMany(attemptIds, rows, (r) => r.attempt_id);
    });

    this.byAttemptQuestionIdLoader = new DataLoader(async (attemptQuestionIds) => {
      if (attemptQuestionIds.length === 0) return [];

      const rows = await db
        .table('quiz_attempt_answer')
        .whereIn('attempt_question_id', attemptQuestionIds)
        .select();

      return mapToMany(attemptQuestionIds, rows, (r) => r.attempt_question_id);
    });

    this.byAnswerIdLoader = new DataLoader(async (answerIds) => {
      if (answerIds.length === 0) return [];

      const rows = await db.table('quiz_attempt_answer').whereIn('answer_id', answerIds).select();

      return mapToMany(answerIds, rows, (r) => r.answer_id);
    });

    this.loadAll = async () => {
      const result = await db.table('quiz_attempt_answer').select();

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
      byAttemptQuestionIdLoader: this.byAttemptQuestionIdLoader,
      byAnswerIdLoader: this.byAnswerIdLoader,
    };
  }

  /** Load a single QuizAttemptAnswer by its primary key */
  loadById(id: number): Promise<QuizAttemptAnswerType> {
    return this.byIdLoader.load(id);
  }

  /** Load many QuizAttemptAnswer records by primary key */
  loadManyByIds(ids: number[]): Promise<ReadonlyArray<QuizAttemptAnswerType | Error>> {
    return this.byIdLoader.loadMany(ids);
  }

  /** Load all QuizAttemptAnswer records with attempt_id = `attemptId` */
  loadByAttemptId(attemptId: number): Promise<ReadonlyArray<QuizAttemptAnswerType>> {
    return this.byAttemptIdLoader.load(attemptId);
  }

  /** Load all QuizAttemptAnswer records with attempt_question_id = `attemptQuestionId` */
  loadByAttemptQuestionId(
    attemptQuestionId: number,
  ): Promise<ReadonlyArray<QuizAttemptAnswerType>> {
    return this.byAttemptQuestionIdLoader.load(attemptQuestionId);
  }

  /** Load all QuizAttemptAnswer records with answer_id = `answerId` */
  loadByAnswerId(answerId: number): Promise<ReadonlyArray<QuizAttemptAnswerType>> {
    return this.byAnswerIdLoader.load(answerId);
  }
}
