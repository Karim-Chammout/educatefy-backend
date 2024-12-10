import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('account_role', function (table) {
      table.increments('id', { primaryKey: true });
      table.string('denomination').notNullable().unique();
      table.string('code').notNullable().unique();
      table.string('description').notNullable();
      table.timestamps(true, true);

      table.index("code");
    })
    .then(() => {
      return knex.schema.raw(`
        INSERT INTO account_role (denomination, code, description) VALUES
          ('Student', 'student', 'Student role account without any special permissions'),
          ('Teacher', 'teacher', 'Teacher account with special permissions to create content')
      `);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('account_role');
}
