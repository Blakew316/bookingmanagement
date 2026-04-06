import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET / - List all active spaces
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM spaces WHERE is_active = 1 ORDER BY name').all();
  res.json(rows);
});

// POST / - Create space
router.post('/', (req, res) => {
  const { name, description, capacity, hourly_rate, image_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const result = db.prepare(
    'INSERT INTO spaces (name, description, capacity, hourly_rate, image_url) VALUES (?, ?, ?, ?, ?)'
  ).run(name, description || null, capacity || null, hourly_rate || 0, image_url || null);

  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(space);
});

// PUT /:id - Update space
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Space not found' });
  }

  const { name, description, capacity, hourly_rate, image_url, is_active } = req.body;

  db.prepare(`
    UPDATE spaces SET
      name = ?, description = ?, capacity = ?, hourly_rate = ?, image_url = ?, is_active = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    description ?? existing.description,
    capacity ?? existing.capacity,
    hourly_rate ?? existing.hourly_rate,
    image_url ?? existing.image_url,
    is_active ?? existing.is_active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /:id - Soft delete
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Space not found' });
  }

  db.prepare('UPDATE spaces SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Space deactivated' });
});

export default router;
