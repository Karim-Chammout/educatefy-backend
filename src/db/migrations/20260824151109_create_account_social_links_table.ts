import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('account_social_links', function (table) {
    table.comment(
      'Social media links for any account (teachers and students). Multiple links per platform are allowed; at most one link per account is flagged as primary.',
    );
    table.increments('id', { primaryKey: true });
    table
      .integer('account_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('account')
      .onDelete('CASCADE');
    table.string('platform', 32).notNullable();
    table.string('user_name', 100).nullable();
    table
      .string('display_name', 100)
      .nullable()
      .comment('Optional custom label chosen by the user');
    table.string('url', 2048).notNullable();
    table.boolean('is_primary').notNullable().defaultTo(false);

    table.index('account_id');
    table.timestamps(true, true);
  });

  // At most one primary link per account (knex schema builder cannot express
  // partial indexes).
  await knex.raw(`
    CREATE UNIQUE INDEX account_social_links_one_primary_per_account
    ON account_social_links (account_id)
    WHERE is_primary = TRUE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('account_social_links');
}
