import { EnvironmentConfig } from './environment.model';

export const environment: EnvironmentConfig = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  supabase: {
    url: 'https://uibuaoyqaoimrsaptsjh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYnVhb3lxYW9pbXJzYXB0c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMzk1NTQsImV4cCI6MjA5NjYxNTU1NH0.-tXb0nTVHvZ_qZh8dQsogi7v9UGBQdNeBMlzH3SVx1k'
  }
};