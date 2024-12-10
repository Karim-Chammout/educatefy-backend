import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('file', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('file_name').notNullable();
    table.string('file_type').notNullable();
    table.string('mime_type');
    table.integer('size_in_bytes');
    table.string('key');
    table.string('uuid');
    table.integer('account_id').unsigned();
    table.foreign('account_id').references('id').inTable('account');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('file');
}
