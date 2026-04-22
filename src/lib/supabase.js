import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://woolvhuppucomhlulddl.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XZvU9Y7TUQ5Ss5PKQDhhjA_u6elnsHD'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
