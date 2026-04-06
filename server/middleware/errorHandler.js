export default function errorHandler(err, req, res, _next) {
  console.error('Server error:', err.stack || err.message || err);

  const status = err.status || 500;
  const message = err.status ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
}
