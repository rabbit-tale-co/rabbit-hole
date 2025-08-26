import { Session, User } from "@supabase/supabase-js";
import type { ProfileRow } from "./db";

export type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileRow | null;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    cover_url?: string;
    accent_color?: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};
