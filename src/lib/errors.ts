// Custom error types
export class DatabaseError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ProfileNotFoundError extends Error {
  constructor() {
    super('Investor profile not found');
    this.name = 'ProfileNotFoundError';
  }
}

// Error handling utilities
export function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('JSON object requested, multiple (or no) rows returned')) {
    throw new ProfileNotFoundError();
  }
  
  throw new DatabaseError('Database operation failed', error);
}