export interface EnvironmentConfig {
  production: boolean;
  apiUrl: string;
  supabase: {
    url: string;
    anonKey: string;
  };
}