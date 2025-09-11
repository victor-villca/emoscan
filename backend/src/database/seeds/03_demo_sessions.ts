import { Knex } from 'knex';
import {
  recomputeSessionSummary,
  upsertEmotionSummary,
} from '../../repositories/emotion.repository';

const EMOTIONS = {
  happy: 1,
  sadness: 2,
  neutral: 3,
  angry: 4,
  surprise: 5,
  fear: 6,
};

const createTimestamps = (date: string, time: string) => {
  const base = new Date(`${date}T${time}`);
  return {
    startTime: base,
    endTime: new Date(base.getTime() + 50 * 60000),
  };
};

export async function seed(knex: Knex): Promise<void> {
  const DEMO_USER_EMAIL = 'demo@emoscan.app';

  let user = await knex('users').where('email', DEMO_USER_EMAIL).first();
  if (!user) {
    [user] = await knex('users')
      .insert({
        name: 'Dr. Alex Chen',
        email: DEMO_USER_EMAIL,
      })
      .returning('*');
  }
  const USER_ID = 3;

  await knex('sessions').where('user_id', USER_ID).del();
  console.log(
    `🧹 Limpiando sesiones de demostración anteriores para el usuario: ${DEMO_USER_EMAIL}`
  );

  const scenarios = [
    {
      session: {
        name: 'Caso de Duelo: Ana Gómez',
        date: '2024-08-10',
        start_time: '10:00',
        end_time: '10:50',
      },
      participant: { name: 'Ana Gómez' },
      metrics: [
        {
          emotions: { sadness: 75, neutral: 15, angry: 5, happy: 2, fear: 3 },
          timeOffset: 5,
        },
        {
          emotions: { sadness: 82, neutral: 10, angry: 4, happy: 1, fear: 3 },
          timeOffset: 15,
        },
        {
          emotions: { sadness: 78, neutral: 12, angry: 6, happy: 2, fear: 2 },
          timeOffset: 25,
        },
        {
          emotions: { sadness: 72, neutral: 18, angry: 5, happy: 3, fear: 2 },
          timeOffset: 35,
        },
      ],
    },
    {
      session: {
        name: 'Ansiedad Social: Carlos Ruiz',
        date: '2024-08-11',
        start_time: '11:00',
        end_time: '11:50',
      },
      participant: { name: 'Carlos Ruiz' },
      metrics: [
        {
          emotions: { fear: 65, neutral: 20, sadness: 10, happy: 2, angry: 3 },
          timeOffset: 10,
        },
        {
          emotions: { fear: 71, neutral: 15, sadness: 9, happy: 1, angry: 4 },
          timeOffset: 20,
        },
        {
          emotions: { neutral: 50, fear: 30, happy: 15, sadness: 5, angry: 0 },
          timeOffset: 30,
        },
        {
          emotions: { fear: 68, neutral: 18, sadness: 12, happy: 1, angry: 1 },
          timeOffset: 40,
        },
      ],
    },
    {
      session: {
        name: 'Patrón Negativo: Laura Torres',
        date: '2024-08-12',
        start_time: '09:00',
        end_time: '09:50',
      },
      participant: { name: 'Laura Torres' },
      metrics: [
        {
          emotions: {
            sadness: 40,
            angry: 30,
            neutral: 20,
            fear: 5,
            happy: 3,
            surprise: 2,
          },
          timeOffset: 8,
        },
        {
          emotions: {
            sadness: 45,
            angry: 25,
            neutral: 18,
            fear: 6,
            happy: 4,
            surprise: 2,
          },
          timeOffset: 18,
        },
        {
          emotions: {
            angry: 40,
            sadness: 35,
            neutral: 15,
            fear: 7,
            happy: 2,
            surprise: 1,
          },
          timeOffset: 28,
        },
        {
          emotions: {
            sadness: 50,
            angry: 20,
            neutral: 20,
            fear: 5,
            happy: 3,
            surprise: 2,
          },
          timeOffset: 38,
        },
      ],
    },
    {
      session: {
        name: 'Supresión Emocional: Javier Moreno',
        date: '2024-08-13',
        start_time: '14:00',
        end_time: '14:50',
      },
      participant: { name: 'Javier Moreno' },
      metrics: [
        {
          emotions: {
            neutral: 92,
            sadness: 3,
            happy: 2,
            angry: 1,
            fear: 1,
            surprise: 1,
          },
          timeOffset: 12,
        },
        {
          emotions: {
            neutral: 89,
            sadness: 4,
            happy: 3,
            angry: 1,
            fear: 2,
            surprise: 1,
          },
          timeOffset: 25,
        },
        {
          emotions: {
            neutral: 95,
            sadness: 2,
            happy: 1,
            angry: 1,
            fear: 0,
            surprise: 1,
          },
          timeOffset: 35,
        },
        {
          emotions: {
            neutral: 91,
            sadness: 3,
            happy: 2,
            angry: 2,
            fear: 1,
            surprise: 1,
          },
          timeOffset: 45,
        },
      ],
    },
  ];

  for (const scenario of scenarios) {
    console.log(`🌱 Creando escenario: "${scenario.session.name}"`);

    await knex.transaction(async (trx) => {
      const timestamps = createTimestamps(
        scenario.session.date,
        scenario.session.start_time
      );

      const [session] = await trx('sessions')
        .insert({
          ...scenario.session,
          user_id: USER_ID,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          status: 'completed',
          actual_start_time: timestamps.startTime,
          actual_end_time: timestamps.endTime,
        })
        .returning('*');

      const [participant] = await trx('participants')
        .insert({
          ...scenario.participant,
          session_id: session.id,
        })
        .returning('*');

      const [report] = await trx('emotion_reports')
        .insert({ participant_id: participant.id })
        .returning('*');

      const metricsToInsert = scenario.metrics.flatMap((metricSet) =>
        Object.entries(metricSet.emotions).map(([emotionName, percentage]) => ({
          emotion_report_id: report.id,
          emotion_type_id: EMOTIONS[emotionName as keyof typeof EMOTIONS],
          percentage,
          detected_at: new Date(
            timestamps.startTime.getTime() + metricSet.timeOffset * 60000
          ),
        }))
      );
      await trx('emotion_metrics').insert(metricsToInsert);

      const rows = await trx('emotion_metrics as em')
        .join('emotion_reports as er', 'er.id', 'em.emotion_report_id')
        .join('participants as p', 'p.id', 'er.participant_id')
        .where('p.session_id', session.id)
        .groupBy('em.emotion_type_id')
        .select(
          'em.emotion_type_id',
          trx.raw('AVG(em.percentage) as avg_percentage')
        );

      const totals = {
        happy: 0,
        sadness: 0,
        neutral: 0,
        angry: 0,
        surprise: 0,
        fear: 0,
      };
      const EMOTION_ID_TO_NAME: Record<number, keyof typeof totals> = {
        1: 'happy',
        2: 'sadness',
        3: 'neutral',
        4: 'angry',
        5: 'surprise',
        6: 'fear',
      };
      for (const row of rows) {
        const key = EMOTION_ID_TO_NAME[row.emotion_type_id];
        if (key)
          totals[key] = parseFloat(Number(row.avg_percentage).toFixed(2)) || 0;
      }

      await trx('emotion_summaries').insert({
        session_id: session.id,
        ...totals,
      });
    });
  }

  console.log('✅ Finalizó el seeding de las sesiones de demostración.');
}
