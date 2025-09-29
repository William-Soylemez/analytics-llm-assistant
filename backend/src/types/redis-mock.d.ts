// ABOUTME: TypeScript declaration file for redis-mock library
// ABOUTME: Provides type definitions for the mock Redis client

declare module 'redis-mock' {
  interface RedisClient {
    get(key: string, callback: (err: Error | null, value: string | null) => void): void;
    set(key: string, value: string, callback: () => void): void;
    setex(key: string, seconds: number, value: string, callback: () => void): void;
    del(key: string, callback: (err: Error | null, count: number) => void): void;
    flushall(callback: () => void): void;
  }

  export function createClient(): RedisClient;
}