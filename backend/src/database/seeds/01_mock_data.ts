import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('emotion_transitions').del();
  await knex('emotion_timelines').del();
  await knex('emotion_summaries').del();
  await knex('emotion_metrics').del();
  await knex('emotion_reports').del();
  await knex('participants').del();
  await knex('sessions').del();

  const emotions = ['happy', 'sadness', 'neutral', 'angry', 'surprise', 'fear'];
  const emotionTypeIds: Record<string, number> = {};

  for (const emotion of emotions) {
    const [record] = await knex('emotion_types')
      .insert({ name: emotion })
      .onConflict('name')
      .ignore()
      .returning(['id', 'name']);

    if (record) {
      emotionTypeIds[record.name] = record.id;
    } else {
      const existing = await knex('emotion_types').where({ name: emotion }).first();
      emotionTypeIds[emotion] = existing.id;
    }
  }

  const now = new Date();

  for (let i = 0; i < 11; i++) {
    const sessionName = `Demo Session ${i + 1}`;
    const startHour = 10 + i;
    const endHour = startHour + 1;

    const [session] = await knex('sessions')
      .insert({
        user_id: 1,
        name: sessionName,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - i),
        start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
        end_time: `${endHour.toString().padStart(2, '0')}:00:00`,
      })
      .returning('id');

    const sessionId = session.id;

    const [participant] = await knex('participants')
      .insert({
        session_id: sessionId,
        name: `Test Participant ${i + 1}`,
        face_snapshot_url: 'http://example.com/face.png',
      })
      .returning('id');

    const participantId = participant.id;

    const [emotionReport] = await knex('emotion_reports')
      .insert({ participant_id: participantId })
      .returning('id');

    const emotionReportId = emotionReport.id;

    await knex('emotion_metrics').insert([
      {
        emotion_report_id: emotionReportId,
        emotion_type_id: emotionTypeIds['happy'],
        percentage: 70 + i,
        detected_at: new Date(),
      },
      {
        emotion_report_id: emotionReportId,
        emotion_type_id: emotionTypeIds['neutral'],
        percentage: 30 - i,
        detected_at: new Date(),
      },
    ]);

    await knex('emotion_summaries').insert({
      session_id: sessionId,
      happy: 70 + i,
      sadness: 0,
      neutral: 30 - i,
      angry: 0,
      surprise: 0,
      fear: 0,
    });

    await knex('emotion_timelines').insert({
      session_id: sessionId,
      timestamp: new Date(),
      primary_emotion_id: emotionTypeIds['happy'],
    });

    await knex('emotion_transitions').insert({
      session_id: sessionId,
      emotion_from_id: emotionTypeIds['neutral'],
      emotion_to_id: emotionTypeIds['happy'],
      started_at: new Date(Date.now() - 5 * 60 * 1000),
      duration_minutes: 5,
    });
  }
}
