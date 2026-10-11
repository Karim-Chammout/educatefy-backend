import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notification', function (table) {
    table.comment('In-app notification. Source of truth for history and read state.');
    table.increments('id', { primaryKey: true });
    table
      .integer('account_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('account')
      .comment('Recipient account.');
    table
      .integer('type_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('notification_type')
      .comment('Type of notification, e.g. "course_enrolled".');
    table
      .integer('actor_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('account')
      .comment('Account that caused the notification, e.g. the follower. If any.');
    table
      .jsonb('payload')
      .notNullable()
      .defaultTo('{}')
      .comment('Raw event data, e.g. { "courseId": 123, "courseName": "Intro to TypeScript" }.');
    table.text('link').nullable().comment('Relative frontend route, e.g. /course/:slug');
    table.timestamp('read_at').nullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps(true, true);

    table.index(['account_id', 'created_at']);
    table.index(['account_id', 'read_at']);
    table.index(['actor_id']);
  });

  // The unread count runs on every page load, so it gets a dedicated partial
  // index. It stays small no matter how large `notification` grows.
  await knex.raw(`
    CREATE INDEX notification_unread_per_account
    ON notification (account_id, created_at DESC)
    WHERE read_at IS NULL AND deleted_at IS NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('notification');
}
