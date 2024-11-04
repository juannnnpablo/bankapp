
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsfujdkwvdkjbfimjzrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZnVqZGt3dmRramJmaW1qenJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0ODQ0NTcsImV4cCI6MjA0NjA2MDQ1N30.ruG3LFlNHRs15Oyl6fCbB-brkSluYR5ZJe9rBhUh9t8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);