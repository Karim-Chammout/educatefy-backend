import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('course__subject', function (table) {
    table.comment(
      'This table represents the many-to-many relationship between "course" and "subject" tables.',
    );
    table.increments('id', { primaryKey: true });
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('course');
    table.integer('subject_id').unsigned().notNullable();
    table.foreign('subject_id').references('id').inTable('subject');

    table.index('course_id');
    table.index('subject_id');
    table.unique(['course_id', 'subject_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('course__subject');
}
