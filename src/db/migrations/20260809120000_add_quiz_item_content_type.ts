import type { Knex } from 'knex';

const questionTypeValues = ['single_choice', 'multi_select', 'true_false'];
const mediaTypeValues = ['image', 'video'];
const difficultyValues = ['easy', 'medium', 'hard'];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quiz', function (table) {
    table.comment(
      'A quiz is a content item attachable to a course section. It holds questions, answers and the grading/shuffling settings.',
    );
    table.increments('id', { primaryKey: true });
    table.string('denomination').notNullable().comment('The title of the quiz.');
    table
      .boolean('is_published')
      .notNullable()
      .defaultTo(false)
      .comment('Whether the quiz is publicly visible.');
    table.integer('course_id').unsigned().notNullable().comment('The course this quiz belongs to.');
    table.foreign('course_id').references('id').inTable('course');
    table
      .integer('teacher_id')
      .unsigned()
      .notNullable()
      .comment('The teacher account that created the quiz.');
    table.foreign('teacher_id').references('id').inTable('account');
    table
      .integer('passing_score')
      .notNullable()
      .defaultTo(70)
      .comment('The percentage score required to pass the quiz.');
    table
      .integer('max_attempts')
      .notNullable()
      .defaultTo(3)
      .comment('The maximum number of attempts a student may take.');
    table
      .boolean('shuffle_questions')
      .notNullable()
      .defaultTo(false)
      .comment('Whether questions are presented in random order.');
    table
      .boolean('shuffle_answers')
      .notNullable()
      .defaultTo(false)
      .comment('Whether answer options are presented in random order.');
    table
      .enum('navigation_mode', ['free', 'sequential'], {
        useNative: true,
        enumName: 'quiz_navigation_mode_enum_type',
      })
      .notNullable()
      .defaultTo('free')
      .comment(
        'free: students can move between questions. sequential: questions are answered one at a time.',
      );
    table
      .integer('questions_per_page')
      .notNullable()
      .defaultTo(0)
      .comment('Number of questions shown per page. 0 means all questions on a single page.');
    table
      .integer('time_limit_minutes')
      .nullable()
      .comment('The time limit to complete the quiz in minutes. null means no time limit.');
    table
      .boolean('show_correct_answers')
      .notNullable()
      .defaultTo(true)
      .comment('Whether correct answers are revealed to students after submission.');
    table
      .text('feedback_passed')
      .nullable()
      .comment('Feedback message shown to the student when passing.');
    table
      .text('feedback_failed')
      .nullable()
      .comment('Feedback message shown to the student when failing.');
    table
      .timestamp('deleted_at')
      .nullable()
      .comment('Soft-delete timestamp. A non-null value means the quiz has been deleted.');
    table.timestamps(true, true);

    table.index('teacher_id');
    table.index('course_id');
  });

  await knex.schema.createTable('quiz_question', function (table) {
    table.comment('A question belonging to a quiz.');
    table.increments('id', { primaryKey: true });
    table
      .integer('quiz_id')
      .unsigned()
      .notNullable()
      .comment('The quiz this question belongs to. Deleting the quiz deletes its questions.');
    table.foreign('quiz_id').references('id').inTable('quiz').onDelete('CASCADE');
    table.text('prompt').notNullable().comment('The question text.');
    table
      .enum('question_type', questionTypeValues, {
        useNative: true,
        enumName: 'quiz_question_type_enum_type',
      })
      .notNullable()
      .comment(
        'The answering behavior of the question: single_choice, multi_select or true_false.',
      );
    table
      .integer('points')
      .notNullable()
      .defaultTo(1)
      .comment('Points awarded for answering this question correctly.');
    table
      .integer('rank')
      .notNullable()
      .defaultTo(0)
      .comment('Ordering of the question within the quiz.');
    table
      .text('media_url')
      .nullable()
      .comment('Optional URL of an image or video attached to the question.');
    table
      .enum('media_type', mediaTypeValues, {
        useNative: true,
        enumName: 'quiz_question_media_type_enum_type',
      })
      .nullable()
      .comment('The media kind of media_url: image or video.');
    table.text('hint').nullable().comment('Optional hint shown to the student while answering.');
    table
      .enum('difficulty', difficultyValues, {
        useNative: true,
        enumName: 'quiz_question_difficulty_enum_type',
      })
      .nullable()
      .comment('The estimated difficulty of the question: easy, medium or hard.');
    table
      .text('learning_objective')
      .nullable()
      .comment('The learning objective this question is meant to assess.');
    table
      .text('feedback_correct')
      .nullable()
      .comment('Feedback shown to the student when answering correctly.');
    table
      .text('feedback_incorrect')
      .nullable()
      .comment('Feedback shown to the student when answering incorrectly.');
    table.timestamps(true, true);

    table.index('quiz_id');
  });

  await knex.schema.createTable('quiz_answer', function (table) {
    table.comment('An answer option belonging to a quiz question.');
    table.increments('id', { primaryKey: true });
    table
      .integer('question_id')
      .unsigned()
      .notNullable()
      .comment('The question this answer belongs to. Deleting the question deletes its answers.');
    table.foreign('question_id').references('id').inTable('quiz_question').onDelete('CASCADE');
    table.string('denomination').nullable().comment('The answer option text.');
    table
      .text('image_url')
      .nullable()
      .comment('Optional URL of an image used as the answer option.');
    table
      .boolean('is_correct')
      .notNullable()
      .defaultTo(false)
      .comment('Whether this option is a correct answer.');
    table
      .integer('rank')
      .notNullable()
      .defaultTo(0)
      .comment('Ordering of the answer within its question.');
    table.timestamps(true, true);

    table.index('question_id');
  });

  await knex.schema.createTable('quiz_attempt', function (table) {
    table.comment('A single attempt (session) of an account at taking a quiz.');
    table.increments('id', { primaryKey: true });
    table
      .integer('account_id')
      .unsigned()
      .notNullable()
      .comment('The student account taking the attempt.');
    table.foreign('account_id').references('id').inTable('account');
    table
      .integer('enrollment_id')
      .unsigned()
      .notNullable()
      .comment('The enrollment under which the attempt is taken.');
    table.foreign('enrollment_id').references('id').inTable('enrollment');
    table
      .integer('quiz_id')
      .unsigned()
      .notNullable()
      .comment('The quiz being attempted. Deleting the quiz deletes its attempts.');
    table.foreign('quiz_id').references('id').inTable('quiz').onDelete('CASCADE');
    table
      .integer('seed')
      .notNullable()
      .comment('Random seed used to shuffle questions and answers for this attempt.');
    table
      .enum('status', ['in_progress', 'completed'], {
        useNative: true,
        enumName: 'quiz_attempt_status_enum_type',
      })
      .notNullable()
      .defaultTo('in_progress')
      .comment(
        'in_progress while the student is answering, completed once submitted or timed out.',
      );
    table
      .integer('attempt_number')
      .notNullable()
      .comment('The 1-based number of this attempt for the account on the quiz.');
    table.integer('score').nullable().comment('The final percentage score (0-100) of the attempt.');
    table.integer('earned_points').nullable().comment('The total points earned in the attempt.');
    table.integer('total_points').nullable().comment('The total points available in the attempt.');
    table.boolean('passed').nullable().comment('Whether the attempt met the quiz passing score.');
    table
      .boolean('timed_out')
      .notNullable()
      .defaultTo(false)
      .comment('Whether the attempt was ended because the time limit expired.');
    table
      .timestamp('started_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the attempt started.');
    table.timestamp('submitted_at').nullable().comment('When the attempt was submitted.');
    table.timestamps(true, true);

    table.unique(['account_id', 'quiz_id', 'attempt_number']);
    table.index('account_id');
    table.index('quiz_id');
    table.index('enrollment_id');
  });

  await knex.schema.createTable('quiz_attempt_question', function (table) {
    table.comment('An immutable snapshot of a quiz question as presented during an attempt.');
    table.increments('id', { primaryKey: true });
    table
      .integer('attempt_id')
      .unsigned()
      .notNullable()
      .comment('The attempt this snapshot belongs to.');
    table.foreign('attempt_id').references('id').inTable('quiz_attempt').onDelete('CASCADE');
    table
      .integer('question_id')
      .unsigned()
      .nullable()
      .comment('The source question. Set to null if the question is later deleted.');
    table.foreign('question_id').references('id').inTable('quiz_question').onDelete('SET NULL');
    table.text('prompt').notNullable().comment('Snapshot of the question text at attempt time.');
    table
      .enum('question_type', null, {
        useNative: true,
        enumName: 'quiz_question_type_enum_type',
        existingType: true,
        schemaName: 'public',
      })
      .notNullable()
      .comment('Snapshot of the question type.');
    table.integer('rank').notNullable().comment('Snapshot of the question ordering.');
    table
      .integer('points')
      .notNullable()
      .comment('Snapshot of the points awarded for a correct answer.');
    table.text('media_url').nullable().comment('Snapshot of the question media URL.');
    table
      .enum('media_type', null, {
        useNative: true,
        enumName: 'quiz_question_media_type_enum_type',
        existingType: true,
        schemaName: 'public',
      })
      .nullable()
      .comment('Snapshot of the question media type.');
    table.text('hint').nullable().comment('Snapshot of the question hint.');
    table
      .enum('difficulty', null, {
        useNative: true,
        enumName: 'quiz_question_difficulty_enum_type',
        existingType: true,
        schemaName: 'public',
      })
      .nullable()
      .comment('Snapshot of the question difficulty.');
    table.text('learning_objective').nullable().comment('Snapshot of the learning objective.');
    table.text('feedback_correct').nullable().comment('Snapshot of the correct-answer feedback.');
    table
      .text('feedback_incorrect')
      .nullable()
      .comment('Snapshot of the incorrect-answer feedback.');
    table
      .specificType('answers', 'jsonb')
      .notNullable()
      .comment('Snapshot of the answer options presented to the student, in shuffled order.');
    table.timestamps(true, true);

    table.index('attempt_id');
  });

  await knex.schema.createTable('quiz_attempt_answer', function (table) {
    table.comment('The answer selected by the student for a quiz_attempt_question.');
    table.increments('id', { primaryKey: true });
    table
      .integer('attempt_id')
      .unsigned()
      .notNullable()
      .comment('The attempt this answer belongs to.');
    table.foreign('attempt_id').references('id').inTable('quiz_attempt').onDelete('CASCADE');
    table
      .integer('attempt_question_id')
      .unsigned()
      .notNullable()
      .comment('The attempt question this answer is for.');
    table
      .foreign('attempt_question_id')
      .references('id')
      .inTable('quiz_attempt_question')
      .onDelete('CASCADE');
    table
      .integer('answer_id')
      .unsigned()
      .nullable()
      .comment('The selected source answer. Set to null if the answer is later deleted.');
    table.foreign('answer_id').references('id').inTable('quiz_answer').onDelete('SET NULL');
    table.string('denomination').nullable().comment('Snapshot of the selected answer text.');
    table.text('image_url').nullable().comment('Snapshot of the selected answer image URL.');
    table.boolean('is_correct').notNullable().comment('Whether the selected answer was correct.');
    table.timestamps(true, true);

    table.index('attempt_id');
    table.index('attempt_question_id');
  });

  // Extend course_section_item.content_type enum to include 'quiz'
  return knex.transaction(async (trx) => {
    await trx.raw(`
      CREATE TYPE course_section_item_content_type_enum_type_new AS ENUM ('lesson', 'quiz')
    `);

    await trx.raw(`
      ALTER TABLE course_section_item
      ALTER COLUMN content_type TYPE course_section_item_content_type_enum_type_new
      USING content_type::text::course_section_item_content_type_enum_type_new
    `);

    await trx.raw(`
      DROP TYPE course_section_item_content_type_enum_type
    `);

    await trx.raw(`
      ALTER TYPE course_section_item_content_type_enum_type_new RENAME TO course_section_item_content_type_enum_type
    `);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove rows that use the enum value being dropped
  await knex('course_section_item').where('content_type', 'quiz').del();

  await knex.transaction(async (trx) => {
    await trx.raw(`
      CREATE TYPE course_section_item_content_type_enum_type_new AS ENUM ('lesson')
    `);

    await trx.raw(`
      ALTER TABLE course_section_item
      ALTER COLUMN content_type TYPE course_section_item_content_type_enum_type_new
      USING content_type::text::course_section_item_content_type_enum_type_new
    `);

    await trx.raw(`
      DROP TYPE course_section_item_content_type_enum_type
    `);

    await trx.raw(`
      ALTER TYPE course_section_item_content_type_enum_type_new RENAME TO course_section_item_content_type_enum_type
    `);
  });

  await knex.schema.dropTable('quiz_attempt_answer');
  await knex.schema.dropTable('quiz_attempt_question');
  await knex.schema.dropTable('quiz_attempt');
  await knex.schema.dropTable('quiz_answer');
  await knex.schema.dropTable('quiz_question');
  await knex.schema.dropTable('quiz');

  await knex.raw('DROP TYPE IF EXISTS quiz_question_type_enum_type');
  await knex.raw('DROP TYPE IF EXISTS quiz_question_media_type_enum_type');
  await knex.raw('DROP TYPE IF EXISTS quiz_question_difficulty_enum_type');
  await knex.raw('DROP TYPE IF EXISTS quiz_navigation_mode_enum_type');
  await knex.raw('DROP TYPE IF EXISTS quiz_attempt_status_enum_type');
}
