// Mock Supabase client for UI mockup mode — no real credentials needed
/* eslint-disable @typescript-eslint/no-explicit-any */

export function createClient() {
  return {
    auth: {
      onAuthStateChange: (_event: any, _session: any) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async (_options: any) => ({ error: null }),
      signUp: async (_options: any) => ({ error: null }),
      signInWithOAuth: async (_options: any) => ({ error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => ({
      select: (_columns?: string) => ({
        eq: (_column: string, _value: any) => ({
          single: async () => ({ data: {} as any, error: null }),
        }),
      }),
      upsert: async (_data: any) => ({ error: null }),
    }),
  }
}
