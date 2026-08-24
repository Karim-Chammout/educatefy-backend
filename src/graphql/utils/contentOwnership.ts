import type { ReadersType } from '../ctx/db/index.js';
import type { QuizAnswer } from '../../types/db-generated-types.js';

type ComponentParentRef = {
  parent_id: number;
  parent_table: string;
};

export const getContentComponentOwnerId = async (
  loaders: ReadersType,
  parent: ComponentParentRef,
): Promise<number | null> => {
  if (parent.parent_table === 'lesson') {
    const lesson = await loaders.Lesson.loadById(parent.parent_id);

    return lesson ? lesson.teacher_id : null;
  }

  if (parent.parent_table === 'course') {
    const course = await loaders.Course.loadById(parent.parent_id);

    return course ? course.teacher_id : null;
  }

  return null;
};

export const getQuizOwnerIdByAnswer = async (
  loaders: ReadersType,
  answer: Pick<QuizAnswer, 'question_id'>,
): Promise<number | null> => {
  if (!answer.question_id) {
    return null;
  }

  const question = await loaders.QuizQuestion.loadById(answer.question_id);

  if (!question) {
    return null;
  }

  const quiz = await loaders.Quiz.loadById(question.quiz_id);

  return quiz ? quiz.teacher_id : null;
};
