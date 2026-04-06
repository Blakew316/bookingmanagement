import express from 'express';
import cors from 'cors';
import migrate from './migrate.js';
import eventsRouter from './routes/events.js';
import contactsRouter from './routes/contacts.js';
import spacesRouter from './routes/spaces.js';
import paymentsRouter from './routes/payments.js';
import reportsRouter from './routes/reports.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Run migrations and seed on startup
migrate();

// API routes
app.use('/api/events', eventsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reports', reportsRouter);

// Health check / root
app.get('/api', (req, res) => {
  res.json({
    message: 'Event Booking Management API',
    version: '1.0.0',
    endpoints: [
      '/api/events',
      '/api/contacts',
      '/api/spaces',
      '/api/payments',
      '/api/reports',
    ],
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
