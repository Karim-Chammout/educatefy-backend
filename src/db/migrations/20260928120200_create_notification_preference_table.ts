import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notification_preference', function (table) {
    table.comment('Channel switches per notification type. A missing row means both are on.');
    table.increments('id', { primaryKey: true });
    table
      .integer('account_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('account')
      .comment('Account whose preferences these are.');
    table
      .integer('type_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('notification_type')
      .comment('Notification type for which to set preferences.');
    table.boolean('email_enabled').notNullable().defaultTo(true);
    table.boolean('in_app_enabled').notNullable().defaultTo(true);
    table.timestamps(true, true);

    table.index(['account_id']);
    table.unique(['account_id', 'type_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('notification_preference');
}
