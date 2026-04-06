import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET / - List contacts with search
router.get('/', (req, res) => {
  const { search } = req.query;

  let sql = 'SELECT * FROM contacts';
  const params = [];

  if (search) {
    sql += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY last_name, first_name';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /:id - Single contact with their events
router.get('/:id', (req, res) => {
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const events = db.prepare(`
    SELECT e.*, s.name AS space_name
    FROM events e
    LEFT JOIN spaces s ON e.space_id = s.id
    WHERE e.contact_id = ?
    ORDER BY e.event_date DESC
  `).all(req.params.id);

  res.json({ ...contact, events });
});

// POST / - Create contact
router.post('/', (req, res) => {
  const { first_name, last_name, email, phone, company, notes } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  const result = db.prepare(
    'INSERT INTO contacts (first_name, last_name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(first_name, last_name, email || null, phone || null, company || null, notes || null);

  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(contact);
});

// PUT /:id - Update contact
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const { first_name, last_name, email, phone, company, notes } = req.body;

  db.prepare(`
    UPDATE contacts SET
      first_name = ?, last_name = ?, email = ?, phone = ?, company = ?, notes = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    first_name ?? existing.first_name,
    last_name ?? existing.last_name,
    email ?? existing.email,
    phone ?? existing.phone,
    company ?? existing.company,
    notes ?? existing.notes,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - Delete contact (block if has events)
router.delete('/:id', (req, res) => {
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const eventCount = db.prepare('SELECT COUNT(*) as c FROM events WHERE contact_id = ?').get(req.params.id);
  if (eventCount.c > 0) {
    return res.status(400).json({ error: 'Cannot delete contact with associated events' });
  }

  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Contact deleted' });
});

export default router;
