import express from 'express';
import pg from 'pg';

const app = express();
app.use(express.json());
const pool = new pg.Pool({
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'tech365',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tech365db',
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({status: 'ok', database: 'connected'});
  } catch {
    res.status(503).json({status: 'unavailable'});
  }
});

app.get('/api/tasks', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, title, completed FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Unable to list tasks'});
  }
});

app.post('/api/tasks', async (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.length > 200) {
    return res.status(400).json({error: 'Title must be between 1 and 200 characters'});
  }
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Unable to create task'});
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  if (typeof req.body?.completed !== 'boolean') return res.status(400).json({error: 'completed must be boolean'});
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING id, title, completed',
      [req.body.completed, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({error: 'Not found'});
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Unable to update task'});
  }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function start() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE
      )`);
      app.listen(3000, '0.0.0.0', () => console.log('API listening on port 3000'));
      return;
    } catch (err) {
      console.error(`Database not ready (${attempt}/30):`, err.message);
      await sleep(2000);
    }
  }
  process.exit(1);
}
start();
