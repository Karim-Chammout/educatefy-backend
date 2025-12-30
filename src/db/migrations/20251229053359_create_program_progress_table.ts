import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('program_progress', function (table) {
    table.comment('This table tracks the progress of an account through a program.');
    table.increments('id', { primaryKey: true });
    table.integer('account__program_id').notNullable().references('id').inTable('account__program');
    table
      .enum('status', ['not_started', 'unenrolled', 'in_progress', 'completed'], {
        useNative: true,
        enumName: 'program_progress_status_type',
      })
      .notNullable()
      .defaultTo('not_started');
    table.timestamp('started_at').notNullable();
    table.timestamp('completed_at').nullable();
    table.timestamp('last_viewed_at').notNullable();
    table.timestamps(true, true);

    table.index('account__program_id');
    table.unique(['account__program_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('program_progress');
}
