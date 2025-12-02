import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nofcrxhaotlllwzqjgpg.supabase.co' // Lấy trong Settings -> API
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZmNyeGhhb3RsbGx3enFqZ3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDIwMDMsImV4cCI6MjA4MDE3ODAwM30.mI3h1_a4_ct7J9vLM6W-oUJzSoms-c1TX_sLDsq0404' // Lấy trong Settings -> API
export const supabase = createClient(supabaseUrl, supabaseKey)