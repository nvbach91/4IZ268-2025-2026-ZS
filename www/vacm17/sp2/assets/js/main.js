import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = 'https://bxkvjqcmykdnzjjinfzf.supabase.co';
const supabaseKey = "sb_publishable_14WkpONyvoqvnT1W8g7VGQ_kAf_n5Y6";
const supabase = createClient(supabaseUrl, supabaseKey);

// Test pro zjištění zda REST API funguje korektně
async function getCPUs() {
    let {data: cpu, error} = await supabase.from('cpu').select('*');

    if (error) {
        console.error('DEBUG: cpu table error:', error);
        return null;
    } else {
        return cpu;
    }
}

console.log("DEBUG: cpu table resp:", getCPUs())