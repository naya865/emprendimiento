// supabaseClient.js
const SUPABASE_URL = "https://gdbsrowjgizzyflvcktp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_y6ebaxeYQMi3hSxstUqCmA_xs7FKHE4";

// Exportamos el cliente para poder usarlo en otros archivos
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);