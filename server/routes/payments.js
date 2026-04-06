import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET / - List payments with optional event_id filter
router.get('/', (req, res) => {
  const { event_id } = req.query;

  let where = ['1=1'];
  const params = [];

  if (event_id) {
    where.push('p.event_id = ?');
    params.push(event_id);
  }

  const rows = db.prepare(`
    SELECT p.*,
      e.title AS event_title,
      c.first_name || ' ' || c.last_name AS contact_name
    FROM payments p
    LEFT JOIN events e ON p.event_id = e.id
    LEFT JOIN contacts c ON e.contact_id = c.id
    WHERE ${where.join(' AND ')}
    ORDER BY p.payment_date DESC
  `).all(...params);

  res.json(rows);
});

// GET /summary - Revenue summary
router.get('/summary', (req, res) => {
  const summary = db.prepare(`
    SELECT
      COALESCE(SUM(p.amount), 0) AS total_revenue,
      COALESCE(
        (SELECT SUM(e.total_amount) FROM events e WHERE e.status NOT IN ('cancelled')) -
        SUM(p.amount),
        0
      ) AS total_outstanding,
      COALESCE(
        (SELECT SUM(p2.amount) FROM payments p2 WHERE p2.payment_type = 'deposit'),
        0
      ) AS total_deposits
    FROM payments p
    LEFT JOIN events e ON p.event_id = e.id
    WHERE e.status != 'cancelled' OR e.status IS NULL
  `).get();

  res.json(summary);
});

// POST / - Create payment
router.post('/', (req, res) => {
  const { event_id, amount, payment_type, payment_method, payment_date, notes } = req.body;

  if (!event_id || !amount || !payment_type) {
    return res.status(400).json({ error: 'event_id, amount, and payment_type are required' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const validTypes = ['deposit', 'partial', 'final'];
  if (!validTypes.includes(payment_type)) {
    return res.status(400).json({ error: `payment_type must be one of: ${validTypes.join(', ')}` });
  }

  const result = db.prepare(
    'INSERT INTO payments (event_id, amount, payment_type, payment_method, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(event_id, amount, payment_type, payment_method || null, payment_date || null, notes || null);

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(payment);
});

// DELETE /:id - Delete payment
router.delete('/:id', (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Payment deleted' });
});

export default router;
