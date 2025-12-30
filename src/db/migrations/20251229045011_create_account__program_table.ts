import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('account__program', function (table) {
      table.comment(
        'This table represents the many-to-many relationship between "account" and "program" tables.',
      );
      table.increments('id', { primaryKey: true });
      table.integer('account_id').notNullable().references('id').inTable('account');
      table.integer('program_id').notNullable().references('id').inTable('program');
      table.timestamp('deleted_at').nullable();
      table.timestamps(true, true);

      table.index('account_id');
      table.index('program_id');
      table.unique(['account_id', 'program_id']);
    })
    .then(() => {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX account_program_active_unique 
        ON account__program (account_id, program_id) 
        WHERE deleted_at IS NULL;
      `);
    });
}

export async function down(knex: Knex): Promise<void> {
  // Remove the partial unique index
  await knex.schema.raw(`
    DROP INDEX IF EXISTS account_program_active_unique
  `);

  return knex.schema.dropTable('account__program');
}
