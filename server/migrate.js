import db from './db.js';

export default function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      capacity INTEGER,
      hourly_rate REAL DEFAULT 0,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      contact_id INTEGER,
      space_id INTEGER,
      event_date TEXT,
      start_time TEXT,
      end_time TEXT,
      guest_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'inquiry',
      event_type TEXT,
      total_amount REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (space_id) REFERENCES spaces(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_type TEXT NOT NULL,
      payment_method TEXT,
      payment_date TEXT DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);

  // Seed only if tables are empty
  const count = db.prepare('SELECT COUNT(*) as c FROM spaces').get();
  if (count.c > 0) return;

  // --- Spaces ---
  const insertSpace = db.prepare(
    'INSERT INTO spaces (name, description, capacity, hourly_rate, image_url) VALUES (?, ?, ?, ?, ?)'
  );
  const spaces = [
    ['Grand Ballroom', 'Elegant ballroom with crystal chandeliers and a grand stage, perfect for large-scale events.', 500, 350, '/images/ballroom.jpg'],
    ['Rooftop Terrace', 'Open-air terrace with panoramic city views, ideal for cocktail receptions and sunset events.', 150, 200, '/images/rooftop.jpg'],
    ['Garden Pavilion', 'Lush garden setting with a covered pavilion, perfect for outdoor ceremonies and receptions.', 200, 250, '/images/garden.jpg'],
    ['Board Room', 'Executive boardroom with state-of-the-art AV equipment for corporate meetings and presentations.', 30, 120, '/images/boardroom.jpg'],
    ['The Loft', 'Industrial-chic loft space with exposed brick and high ceilings, great for creative events.', 100, 180, '/images/loft.jpg'],
  ];
  for (const s of spaces) insertSpace.run(...s);

  // --- Contacts ---
  const insertContact = db.prepare(
    'INSERT INTO contacts (first_name, last_name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const contacts = [
    ['Sarah', 'Mitchell', 'sarah.mitchell@brightwave.com', '(555) 234-5678', 'Brightwave Media', 'Preferred client, hosts annual gala'],
    ['James', 'Rodriguez', 'james.r@techfusion.io', '(555) 345-6789', 'TechFusion Inc', 'Corporate account, quarterly events'],
    ['Emily', 'Chen', 'emily.chen@gmail.com', '(555) 456-7890', null, 'Wedding client, referred by Sarah M.'],
    ['Marcus', 'Thompson', 'marcus.t@globalventures.com', '(555) 567-8901', 'Global Ventures', 'VP of Operations'],
    ['Olivia', 'Parker', 'olivia.parker@designhaus.co', '(555) 678-9012', 'DesignHaus Co', 'Product launch events'],
    ['David', 'Kim', 'david.kim@outlook.com', '(555) 789-0123', null, 'Birthday party for daughter'],
    ['Rachel', 'Foster', 'rachel.f@nonprofit.org', '(555) 890-1234', 'Hearts United Foundation', 'Annual charity fundraiser'],
    ['Anthony', 'Williams', 'a.williams@summit.legal', '(555) 901-2345', 'Summit Legal Group', 'Firm anniversary celebration'],
  ];
  for (const c of contacts) insertContact.run(...c);

  // --- Events ---
  const insertEvent = db.prepare(
    `INSERT INTO events (title, description, contact_id, space_id, event_date, start_time, end_time, guest_count, status, event_type, total_amount, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const events = [
    ['Mitchell Annual Gala 2026', 'Annual corporate gala with dinner, live entertainment, and awards ceremony.', 1, 1, '2026-06-15', '18:00', '23:00', 350, 'confirmed', 'gala', 17500, 'Full catering and live band confirmed'],
    ['TechFusion Q2 Summit', 'Quarterly all-hands meeting with product demos and team building.', 2, 4, '2026-04-22', '09:00', '17:00', 28, 'confirmed', 'corporate', 960, 'Needs projector and video conferencing setup'],
    ['Chen-Williams Wedding', 'Wedding ceremony and reception with garden theme.', 3, 3, '2026-09-12', '14:00', '22:00', 180, 'proposal', 'wedding', 12000, 'Floral arrangements pending approval'],
    ['Global Ventures Product Launch', 'New product reveal event with press and VIP guests.', 4, 5, '2026-05-08', '17:00', '21:00', 80, 'confirmed', 'corporate', 5400, 'Press kits and branded materials needed'],
    ['DesignHaus Collection Reveal', 'Exclusive reveal of the autumn design collection.', 5, 5, '2026-07-20', '19:00', '22:00', 60, 'inquiry', 'social', 3240, 'Mood board and lighting plan in review'],
    ['Lily Kim Birthday Party', 'Sweet sixteen birthday celebration with DJ and photo booth.', 6, 2, '2026-05-30', '16:00', '21:00', 75, 'proposal', 'birthday', 5000, 'Balloon arch and custom cake requested'],
    ['Hearts United Charity Gala', 'Annual fundraiser dinner with silent auction.', 7, 1, '2026-11-08', '18:00', '23:00', 400, 'inquiry', 'gala', 17500, 'Auction platform integration needed'],
    ['Summit Legal 25th Anniversary', 'Firm milestone celebration for partners and staff.', 8, 2, '2026-08-14', '18:00', '22:00', 120, 'proposal', 'corporate', 4800, 'Formal dress code, partner speeches'],
    ['TechFusion Holiday Party', 'Year-end holiday celebration with team activities.', 2, 1, '2025-12-18', '17:00', '22:00', 200, 'completed', 'social', 8750, 'Completed successfully, great feedback'],
    ['Mitchell Spring Mixer', 'Casual networking event for clients and partners.', 1, 2, '2026-03-20', '17:00', '20:00', 60, 'completed', 'social', 3600, 'Strong turnout, positive reviews'],
    ['DesignHaus Spring Workshop', 'Hands-on design workshop for VIP clients.', 5, 4, '2026-03-05', '10:00', '15:00', 25, 'completed', 'corporate', 600, 'Workshop materials provided by client'],
    ['Chen Bridal Shower', 'Pre-wedding bridal shower celebration.', 3, 2, '2026-08-01', '12:00', '16:00', 40, 'inquiry', 'social', 3200, 'Coordinating with wedding planner'],
    ['Rodriguez Birthday Bash', 'Surprise 40th birthday party.', 2, 5, '2026-06-05', '19:00', '23:00', 50, 'cancelled', 'birthday', 3600, 'Client rescheduled, will rebook'],
    ['Foster Memorial Dinner', 'Intimate memorial dinner for foundation supporters.', 7, 4, '2026-04-10', '18:00', '21:00', 25, 'confirmed', 'social', 360, 'Dietary restrictions list pending'],
    ['Williams Retirement Party', 'Retirement celebration for senior partner.', 8, 3, '2026-10-25', '17:00', '21:00', 100, 'inquiry', 'social', 5000, 'Venue walkthrough scheduled'],
  ];
  for (const e of events) insertEvent.run(...e);

  // --- Payments ---
  const insertPayment = db.prepare(
    'INSERT INTO payments (event_id, amount, payment_type, payment_method, payment_date, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const payments = [
    // Event 1 - Gala (confirmed, mostly paid)
    [1, 5000, 'deposit', 'credit_card', '2026-02-10', 'Initial deposit'],
    [1, 6000, 'partial', 'bank_transfer', '2026-03-15', 'Second installment'],
    [1, 4000, 'partial', 'bank_transfer', '2026-04-01', 'Third installment'],
    // Event 2 - TechFusion Q2 (confirmed, fully paid)
    [2, 500, 'deposit', 'credit_card', '2026-03-01', 'Deposit'],
    [2, 460, 'final', 'credit_card', '2026-04-01', 'Final payment'],
    // Event 3 - Wedding (proposal, deposit only)
    [3, 3000, 'deposit', 'bank_transfer', '2026-04-05', 'Wedding deposit'],
    // Event 4 - Product Launch (confirmed, partial)
    [4, 2000, 'deposit', 'credit_card', '2026-03-20', 'Deposit'],
    [4, 2000, 'partial', 'bank_transfer', '2026-04-03', 'Partial payment'],
    // Event 6 - Birthday (proposal, deposit)
    [6, 1500, 'deposit', 'credit_card', '2026-04-02', 'Birthday party deposit'],
    // Event 9 - Holiday Party (completed, fully paid)
    [9, 3000, 'deposit', 'credit_card', '2025-10-15', 'Deposit'],
    [9, 3000, 'partial', 'bank_transfer', '2025-11-20', 'Second payment'],
    [9, 2750, 'final', 'credit_card', '2025-12-20', 'Final payment'],
    // Event 10 - Spring Mixer (completed, fully paid)
    [10, 1800, 'deposit', 'credit_card', '2026-02-01', 'Deposit'],
    [10, 1800, 'final', 'bank_transfer', '2026-03-22', 'Final payment'],
    // Event 11 - Workshop (completed, fully paid)
    [11, 600, 'final', 'credit_card', '2026-03-06', 'Full payment'],
    // Event 14 - Memorial Dinner (confirmed, deposit)
    [14, 180, 'deposit', 'check', '2026-03-28', 'Deposit via check'],
    // Event 8 - Anniversary (proposal, deposit)
    [8, 1500, 'deposit', 'bank_transfer', '2026-04-04', 'Deposit for anniversary'],
    // Event 7 - Charity Gala (inquiry, no payment yet — but small good-faith deposit)
    [7, 2000, 'deposit', 'credit_card', '2026-04-06', 'Good-faith deposit'],
    // Event 15 - Retirement (inquiry, no payments)
    // Event 5 - Collection Reveal (inquiry, no payments)
    // Event 13 - Cancelled (had a deposit that was refunded — we still record it)
    [13, 1000, 'deposit', 'credit_card', '2026-03-10', 'Deposit — refund pending'],
    // Extra payments for variety
    [1, 2500, 'partial', 'check', '2026-05-01', 'Additional installment'],
    [4, 1400, 'final', 'credit_card', '2026-04-30', 'Final balance'],
  ];
  for (const p of payments) insertPayment.run(...p);

  console.log('Database seeded successfully.');
}
