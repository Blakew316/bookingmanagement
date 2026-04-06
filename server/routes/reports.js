import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /overview - KPI stats
router.get('/overview', (req, res) => {
  const totalRevenue = db.prepare(`
    SELECT COALESCE(SUM(p.amount), 0) AS value
    FROM payments p
    JOIN events e ON p.event_id = e.id
    WHERE e.status != 'cancelled'
  `).get().value;

  const totalEventAmount = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) AS value
    FROM events WHERE status NOT IN ('cancelled')
  `).get().value;

  const outstandingBalance = totalEventAmount - totalRevenue;

  const totalEvents = db.prepare('SELECT COUNT(*) AS value FROM events').get().value;

  const confirmedCount = db.prepare(
    "SELECT COUNT(*) AS value FROM events WHERE status = 'confirmed'"
  ).get().value;

  const upcomingCount = db.prepare(
    "SELECT COUNT(*) AS value FROM events WHERE event_date >= date('now') AND status NOT IN ('cancelled', 'completed')"
  ).get().value;

  res.json({
    total_revenue: totalRevenue,
    outstanding_balance: outstandingBalance,
    total_events: totalEvents,
    confirmed_count: confirmedCount,
    upcoming_count: upcomingCount,
  });
});

// GET /revenue-by-month - Last 12 months revenue aggregated
router.get('/revenue-by-month', (req, res) => {
  const rows = db.prepare(`
    SELECT
      strftime('%Y-%m', p.payment_date) AS month,
      SUM(p.amount) AS revenue
    FROM payments p
    JOIN events e ON p.event_id = e.id
    WHERE p.payment_date >= date('now', '-12 months')
      AND e.status != 'cancelled'
    GROUP BY month
    ORDER BY month
  `).all();

  res.json(rows);
});

// GET /events-by-type - Count of events by event_type
router.get('/events-by-type', (req, res) => {
  const rows = db.prepare(`
    SELECT event_type, COUNT(*) AS count
    FROM events
    WHERE event_type IS NOT NULL
    GROUP BY event_type
    ORDER BY count DESC
  `).all();

  res.json(rows);
});

// GET /events-by-status - Count of events by status
router.get('/events-by-status', (req, res) => {
  const rows = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM events
    GROUP BY status
    ORDER BY count DESC
  `).all();

  res.json(rows);
});

// GET /upcoming - Next 30 days events
router.get('/upcoming', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*,
      c.first_name || ' ' || c.last_name AS contact_name,
      s.name AS space_name,
      COALESCE(SUM(p.amount), 0) AS total_paid
    FROM events e
    LEFT JOIN contacts c ON e.contact_id = c.id
    LEFT JOIN spaces s ON e.space_id = s.id
    LEFT JOIN payments p ON p.event_id = e.id
    WHERE e.event_date BETWEEN date('now') AND date('now', '+30 days')
      AND e.status NOT IN ('cancelled', 'completed')
    GROUP BY e.id
    ORDER BY e.event_date ASC
  `).all();

  res.json(rows);
});

export default router;
