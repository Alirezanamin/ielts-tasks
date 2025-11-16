import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  "https://miwvmpedzqalailacddk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pd3ZtcGVkenFhbGFpbGFjZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzUxNDgsImV4cCI6MjA3ODg1MTE0OH0.HAAv8F5BAs3lzmlTmhJMI30TbC89GSt81TMZQ5bUPj4"
);
