import { Client } from 'pg';

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN');

    const {
      rows: [region],
    } = await client.query<{ id: string }>(
      `INSERT INTO regions (name, city, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['홍대', '서울', 37.5563, 126.9236],
    );

    const {
      rows: [store],
    } = await client.query<{ id: string }>(
      `INSERT INTO stores (name, region_id, address, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      ['방탈출 홍대점', region.id, '서울 마포구 홍대입구역 인근', '02-0000-0000'],
    );

    await client.query(
      `INSERT INTO themes (
         store_id, name, description, genre, difficulty,
         player_min, player_max, duration, fear_level
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [store.id, '폐병원의 비밀', '버려진 병원에서 탈출하라', 'HORROR', 4, 2, 6, 60, 5],
    );

    await client.query('COMMIT');
    console.log('Seed complete');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
