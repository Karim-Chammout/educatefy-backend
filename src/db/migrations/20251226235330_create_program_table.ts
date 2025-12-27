import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('program', (table) => {
      table.increments('id', { primaryKey: true });
      table.string('denomination').notNullable();
      table.string('slug').notNullable();
      table.string('subtitle').notNullable();
      table.text('description').notNullable();
      table
        .enum('level', ['beginner', 'intermediate', 'advanced'], {
          useNative: true,
          enumName: 'program_level_enum_type',
        })
        .notNullable();
      table.text('image').nullable();
      table.boolean('is_published').defaultTo(false).notNullable();
      table.integer('teacher_id').notNullable().references('id').inTable('account');
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true);

      table.index('slug');
      table.index('teacher_id');
    })
    .then(() => {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX program_slug_unique_active
        ON program (slug)
        WHERE deleted_at IS NULL;
      `);
    });
}

export async function down(knex: Knex): Promise<void> {
  // Remove the partial unique index
  await knex.schema.raw(`
    DROP INDEX IF EXISTS program_slug_unique_active
  `);

  await knex.schema.dropTable('program');
}
