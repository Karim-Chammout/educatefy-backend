import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('refresh_token', function (table) {
    table.increments('id', { primaryKey: true });
    table.foreign('account_id').references('id').inTable('account');
    table.integer('account_id').unsigned().notNullable();
    table.text('token').notNullable().unique();
    table.boolean('mobile').notNullable().defaultTo(false);
    table.text('browser').notNullable().defaultTo('');
    table.timestamp('expires_at').notNullable();
    table.timestamp('last_used_at').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('refresh_token');
}
