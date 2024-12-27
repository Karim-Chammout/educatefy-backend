import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('account__subject', function (table) {
    table.comment(
      'This table represents the many-to-many relationship between "account" and "subject" tables.',
    );
    table.increments('id', { primaryKey: true });
    table.integer('account_id').unsigned().notNullable();
    table.foreign('account_id').references('id').inTable('account');
    table.integer('subject_id').unsigned().notNullable();
    table.foreign('subject_id').references('id').inTable('subject');

    table.index('account_id');
    table.index('subject_id');
    table.unique(['account_id', 'subject_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('account__subject');
}
