export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard',
    '/session/:sessionId/participant/:participantId',
    '/session/:sessionId',
  ],
};
