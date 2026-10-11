import type { Knex } from 'knex';

const NOTIFICATION_TYPES: ReadonlyArray<{
  code: string;
  category: string;
  audience: string;
  rank: number;
  is_configurable: boolean;
}> = [
  {
    code: 'welcome',
    category: 'account',
    audience: 'all',
    rank: 10,
    is_configurable: false,
  },
  {
    code: 'course_enrolled',
    category: 'teaching',
    audience: 'teacher',
    rank: 20,
    is_configurable: true,
  },
  {
    code: 'program_enrolled',
    category: 'teaching',
    audience: 'teacher',
    rank: 30,
    is_configurable: true,
  },
  {
    code: 'course_rated',
    category: 'teaching',
    audience: 'teacher',
    rank: 40,
    is_configurable: true,
  },
  {
    code: 'new_follower',
    category: 'social',
    audience: 'teacher',
    rank: 50,
    is_configurable: true,
  },
  {
    code: 'course_completed',
    category: 'learning',
    audience: 'student',
    rank: 60,
    is_configurable: true,
  },
  {
    code: 'course_completed_by_student',
    category: 'teaching',
    audience: 'teacher',
    rank: 70,
    is_configurable: true,
  },
  {
    code: 'program_version_published',
    category: 'learning',
    audience: 'student',
    rank: 80,
    is_configurable: true,
  },
];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notification_type', function (table) {
    table.comment('Types the platform can notify about.');
    table.increments('id', { primaryKey: true });
    table
      .string('code')
      .notNullable()
      .unique()
      .comment('Stable code used by GraphQL and templates.');
    table.string('category').notNullable().comment('Grouping used to lay out the preferences UI.');
    table
      .string('audience')
      .notNullable()
      .defaultTo('all')
      .comment('Who can receive this: teacher, student or all.');
    table.integer('rank').notNullable().comment('Display order.');
    table
      .boolean('is_active')
      .notNullable()
      .defaultTo(true)
      .comment('False to disable all notifications of this type.');
    table
      .boolean('is_configurable')
      .notNullable()
      .defaultTo(true)
      .comment('False for types a user cannot turn off, e.g. the signup email.');
    table.timestamps(true, true);

    table.index(['is_active', 'rank']);
  });

  await knex('notification_type').insert(NOTIFICATION_TYPES);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('notification_type');
}
