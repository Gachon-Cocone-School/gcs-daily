import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { env } from "../env";

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL as string,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true,
    },
  },
);
