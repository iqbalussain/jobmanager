// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ujaefswhljrekcwesqyy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYWVmc3dobGpyZWtjd2VzcXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTgzNzQsImV4cCI6MjA2NDk5NDM3NH0.fuQuwpmTVEG0R3w0nGZprldg9sgALYCo0c-WJ_iLwgI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);