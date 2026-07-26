import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('refresh_token', (table) => {
    table.timestamp('revoked_at').nullable().defaultTo(null);
    table.text('ip').defaultTo('').nullable();
    table.text('device').defaultTo('').nullable();
    table.text('country').defaultTo('').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('refresh_token', (table) => {
    table.dropColumn('revoked_at');
    table.dropColumn('ip');
    table.dropColumn('device');
    table.dropColumn('country');
  });
}
