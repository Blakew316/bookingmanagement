import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET / - List events with filters
router.get('/', (req, res) => {
  const { status, search, from, to, space_id, limit } = req.query;

  let where = ['1=1'];
  const params = [];

  if (status) {
    where.push('e.status = ?');
    params.push(status);
  }
  if (search) {
    where.push(`(e.title LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.company LIKE ?)`);
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (from) {
    where.push('e.event_date >= ?');
    params.push(from);
  }
  if (to) {
    where.push('e.event_date <= ?');
    params.push(to);
  }
  if (space_id) {
    where.push('e.space_id = ?');
    params.push(space_id);
  }

  let sql = `
    SELECT e.*,
      c.first_name || ' ' || c.last_name AS contact_name,
      c.email AS contact_email,
      s.name AS space_name,
      COALESCE(SUM(p.amount), 0) AS total_paid,
      CASE
        WHEN e.total_amount = 0 THEN 'none'
        WHEN COALESCE(SUM(p.amount), 0) >= e.total_amount THEN 'paid'
        WHEN COALESCE(SUM(p.amount), 0) > 0 THEN 'partial'
        ELSE 'unpaid'
      END AS payment_status
    FROM events e
    LEFT JOIN contacts c ON e.contact_id = c.id
    LEFT JOIN spaces s ON e.space_id = s.id
    LEFT JOIN payments p ON p.event_id = e.id
    WHERE ${where.join(' AND ')}
    GROUP BY e.id
    ORDER BY e.event_date DESC
  `;

  if (limit) {
    sql += ' LIMIT ?';
    params.push(Number(limit));
  }

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /:id - Single event with full details
router.get('/:id', (req, res) => {
  const event = db.prepare(`
    SELECT e.*,
      c.first_name || ' ' || c.last_name AS contact_name,
      c.email AS contact_email,
      c.phone AS contact_phone,
      c.company AS contact_company,
      s.name AS space_name,
      s.capacity AS space_capacity,
      s.hourly_rate AS space_hourly_rate
    FROM events e
    LEFT JOIN contacts c ON e.contact_id = c.id
    LEFT JOIN spaces s ON e.space_id = s.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const payments = db.prepare('SELECT * FROM payments WHERE event_id = ? ORDER BY payment_date').all(req.params.id);

  res.json({ ...event, payments });
});

// POST / - Create event
router.post('/', (req, res) => {
  const { title, description, contact_id, space_id, event_date, start_time, end_time, guest_count, status, event_type, total_amount, notes } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const result = db.prepare(`
    INSERT INTO events (title, description, contact_id, space_id, event_date, start_time, end_time, guest_count, status, event_type, total_amount, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || null, contact_id || null, space_id || null, event_date || null, start_time || null, end_time || null, guest_count || 0, status || 'inquiry', event_type || null, total_amount || 0, notes || null);

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

// PUT /:id - Update event
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { title, description, contact_id, space_id, event_date, start_time, end_time, guest_count, status, event_type, total_amount, notes } = req.body;

  db.prepare(`
    UPDATE events SET
      title = ?, description = ?, contact_id = ?, space_id = ?,
      event_date = ?, start_time = ?, end_time = ?, guest_count = ?,
      status = ?, event_type = ?, total_amount = ?, notes = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title ?? existing.title,
    description ?? existing.description,
    contact_id ?? existing.contact_id,
    space_id ?? existing.space_id,
    event_date ?? existing.event_date,
    start_time ?? existing.start_time,
    end_time ?? existing.end_time,
    guest_count ?? existing.guest_count,
    status ?? existing.status,
    event_type ?? existing.event_type,
    total_amount ?? existing.total_amount,
    notes ?? existing.notes,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PUT /:id/status - Change status with transition validation
router.put('/:id/status', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Any status can transition to cancelled
  if (status !== 'cancelled') {
    const transitions = {
      inquiry: ['proposal'],
      proposal: ['confirmed'],
      confirmed: ['completed'],
      completed: [],
      cancelled: [],
    };

    const allowed = transitions[event.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from '${event.status}' to '${status}'. Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}.`,
      });
    }
  }

  db.prepare("UPDATE events SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);

  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - Delete event
router.delete('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Delete associated payments first
  db.prepare('DELETE FROM payments WHERE event_id = ?').run(req.params.id);
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);

  res.json({ message: 'Event deleted' });
});

export default router;
