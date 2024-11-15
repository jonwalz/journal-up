import '@elysiajs/jwt';

declare module 'elysia' {
  interface ElysiaContext {
    user: {
      id: string;
      email: string;
    }
  }
}
