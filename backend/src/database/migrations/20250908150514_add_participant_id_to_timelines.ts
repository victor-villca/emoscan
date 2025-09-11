import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('emotion_timelines', (table) => {
    // Añadimos la columna para el ID del participante
    table.integer('participant_id').unsigned();
    // Creamos la relación (foreign key) con la tabla de participantes
    table
      .foreign('participant_id')
      .references('id')
      .inTable('participants')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('emotion_timelines', (table) => {
    // Primero, eliminamos la relación
    table.dropForeign('participant_id');
    // Luego, eliminamos la columna
    table.dropColumn('participant_id');
  });
}
