export const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://meet.google.com',
    'https://*.google.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};