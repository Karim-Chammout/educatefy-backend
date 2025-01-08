import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('lesson', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('denomination').notNullable();
    table.boolean('is_published').notNullable().defaultTo(false);
    table
      .integer('duration')
      .notNullable()
      .comment('The estimated duration of the lesson in minutes');
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('course');
    table.integer('teacher_id').unsigned().notNullable();
    table.foreign('teacher_id').references('id').inTable('account');
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index('teacher_id');
    table.index('course_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('lesson');
}
