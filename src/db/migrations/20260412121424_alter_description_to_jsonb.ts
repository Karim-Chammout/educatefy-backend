import type { Knex } from 'knex';

// Tables where `description` is being migrated to jsonb
const DESCRIPTION_TABLES = ['account', 'course', 'program', 'youtube_content'];

export async function up(knex: Knex): Promise<void> {
  for (const table of DESCRIPTION_TABLES) {
    await knex.schema.alterTable(table, (t) => {
      t.text('description').nullable().alter();
    });

    await knex(table).update({ description: null });

    await knex.raw(
      `
      ALTER TABLE ?? ALTER COLUMN description TYPE jsonb USING description::jsonb
    `,
      [table],
    );
  }

  await knex.schema.alterTable('text_content', (t) => {
    t.text('content').nullable().alter();
  });

  await knex('text_content').update({ content: null });

  await knex.raw(`
    ALTER TABLE text_content ALTER COLUMN content TYPE jsonb USING content::jsonb
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Revert jsonb → text and restore NOT NULL.

  for (const table of DESCRIPTION_TABLES) {
    await knex.raw(
      `
      ALTER TABLE ?? ALTER COLUMN description TYPE text USING description::text
    `,
      [table],
    );

    await knex.schema.alterTable(table, (t) => {
      t.text('description').notNullable().defaultTo('').alter();
    });

    // Remove the default — we only needed it to satisfy NOT NULL during the alter
    await knex.raw(`ALTER TABLE ?? ALTER COLUMN description DROP DEFAULT`, [table]);
  }

  // text_content.content
  await knex.raw(`
    ALTER TABLE text_content ALTER COLUMN content TYPE text USING content::text
  `);

  await knex.schema.alterTable('text_content', (t) => {
    t.text('content').notNullable().defaultTo('').alter();
  });

  await knex.raw(`ALTER TABLE text_content ALTER COLUMN content DROP DEFAULT`);
}
