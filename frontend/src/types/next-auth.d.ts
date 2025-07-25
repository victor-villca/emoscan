import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId?: number;
    };
  }

  interface User {
    id: number;
  }

  interface JWT {
    userId?: number;
  }
}
