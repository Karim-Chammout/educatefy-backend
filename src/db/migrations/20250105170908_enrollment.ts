import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('enrollment', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('course_id').unsigned().notNullable();
    table.foreign('course_id').references('id').inTable('course');
    table.integer('account_id').unsigned().notNullable();
    table.foreign('account_id').references('id').inTable('account');
    table
      .enum('status', ['available', 'enrolled', 'unenrolled', 'completed'], {
        useNative: true,
        enumName: 'enrollment_status_type',
      })
      .notNullable();
    table.timestamps(true, true);

    table.index('account_id');
    table.index('course_id');
    table.unique(['account_id', 'course_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('enrollment');
}
