import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('program_version', function (table) {
    table.increments('id', { primaryKey: true });
    table.integer('program_id').notNullable().references('id').inTable('program');
    table.integer('version_number').unsigned().notNullable();
    table
      .enum('status', ['draft', 'published', 'archived'], {
        useNative: true,
        enumName: 'program_version_status_type',
      })
      .notNullable()
      .defaultTo('draft');
    table.timestamp('published_at').nullable();
    table.timestamps(true, true);

    table.index('program_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('program_version');
  await knex.schema.raw(`DROP TYPE IF EXISTS program_version_status_type`);
}
