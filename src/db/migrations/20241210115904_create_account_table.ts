import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('account', function (table) {
    table.increments('id', { primaryKey: true });
    table.string('email').unique().notNullable();
    table.string('name').nullable().comment('The name given by the openid-client e.g: Goole');
    table.string('nickname').nullable();
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table
      .enum('gender', ['male', 'female', 'unknown'], {
        useNative: true,
        enumName: 'gender_type',
      })
      .nullable();
    table.date('date_of_birth').nullable();
    table
      .string('avatar_url')
      .nullable()
      .comment('The avatar URL given by the openid-client e.g: Goole');
    table
      .string('external_account_id')
      .nullable()
      .comment('The subject ID coming from the openid-client e.g: Goole');
    table.string('external_account_provider').nullable().comment('The openid-client provider');
    table
      .integer('nationality_id')
      .unsigned()
      .nullable()
      .defaultTo(null)
      .comment('The country of origin');
    table.foreign('nationality_id').references('id').inTable('country');
    table
      .integer('country_id')
      .unsigned()
      .nullable()
      .defaultTo(null)
      .comment('The country of residence');
    table.foreign('country_id').references('id').inTable('country');
    table.integer('role_id').unsigned().notNullable().defaultTo(1);
    table.foreign('role_id').references('id').inTable('account_role');
    table
      .string('specialty')
      .nullable()
      .defaultTo(null)
      .comment(
        'Represent the subject a teacher is specialized in for teaching. Used for the TEACHER role accounts.',
      );
    table
      .text('bio')
      .nullable()
      .defaultTo(null)
      .comment('The bio of the teacher. Used for the TEACHER role accounts.');
    table
      .text('description')
      .nullable()
      .defaultTo(null)
      .comment('A detailed overview about this teacher. Used for the TEACHER role accounts.');
    table.timestamps(true, true);

    table.index('email');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('account');
}
