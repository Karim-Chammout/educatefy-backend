import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE outbox_status_type AS ENUM ('pending', 'processing', 'sent', 'failed');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await knex.schema.createTable('outbox', function (table) {
    table.comment('Email queue. Source of truth for delivery and retry state.');
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
      .jsonb('payload')
      .notNullable()
      .defaultTo('{}')
      .comment('Raw event data, e.g. { "courseId": 123, "courseName": "Intro to TypeScript" }.');
    table
      .enum('status', ['pending', 'processing', 'sent', 'failed'], {
        useNative: true,
        enumName: 'outbox_status_type',
        existingType: true,
      })
      .notNullable()
      .defaultTo('pending');
    table.integer('attempts').notNullable().defaultTo(0);
    table
      .timestamp('available_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When the row is eligible for delivery. A retry sets this to now + backoff.');
    table.timestamp('locked_at').nullable().comment('Set while a worker holds the row.');
    table.timestamp('sent_at').nullable().comment('Set when the row is successfully delivered.');
    table
      .string('recipient')
      .nullable()
      .comment(
        'Email address of the recipient, for audit/debug. Copied from account.email at creation time.',
      );
    table.string('subject').nullable().comment('Rendered subject (audit/debug).');
    table.string('provider').nullable().comment('Transport key that delivered this, e.g. resend');
    table
      .string('provider_message_id')
      .nullable()
      .comment('Message ID returned by the provider (for a future webhook lookup).');
    table.text('last_error').nullable();
    table.timestamps(true, true);

    table.index(['account_id']);
  });

  // The worker's hot path: "claimable rows, oldest first".
  await knex.raw(`
    CREATE INDEX outbox_claimable
    ON outbox (available_at, id)
    WHERE status = 'pending';
  `);

  // Stale claim reclaim: "is any worker holding a row right now?".
  await knex.raw(`
    CREATE INDEX outbox_processing_locked_at
    ON outbox (locked_at)
    WHERE status = 'processing';
  `);

  // Lets a delivery/bounce webhook find its row without a second lookup table.
  await knex.raw(`
    CREATE UNIQUE INDEX outbox_provider_message_id
    ON outbox (provider, provider_message_id)
    WHERE provider_message_id IS NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('outbox');
  await knex.raw('DROP TYPE IF EXISTS outbox_status_type');
}
