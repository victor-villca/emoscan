import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sessions', (table) => {
    table.timestamp('actual_start_time').nullable();
    table.timestamp('actual_end_time').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('sessions', (table) => {
    table.dropColumn('actual_start_time');
    table.dropColumn('actual_end_time');
  });
}
