import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('account', (table) => {
    table.dropColumn('specialty');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('account', (table) => {
    table
      .string('specialty')
      .nullable()
      .defaultTo(null)
      .comment(
        'Represent the subject a teacher is specialized in for teaching. Used for the TEACHER role accounts.',
      );
  });
}
