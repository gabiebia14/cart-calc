// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dybsrdtalpnckgyufrjo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YnNyZHRhbHBuY2tneXVmcmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MTU5NTMsImV4cCI6MjA1MjM5MTk1M30.2m7HNvNyiPRlmTxcvlItjOMFYOviw3OcfAZJ6ZhDqkc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);