import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const isBrowser = typeof window !== 'undefined';

export const supabase: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
    isBrowser
        ? {}
        : { realtime: { transport: require('ws') } }
);