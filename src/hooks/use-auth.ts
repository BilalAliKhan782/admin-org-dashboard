import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { identifyUser } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ session: null, user: null, isLoading: true });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setState({ session: data.session, user: data.session?.user ?? null, isLoading: false });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, user: session?.user ?? null, isLoading: false });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.session?.user) {
      identifyUser(state.session.user.id, { email: state.session.user.email });
    }
  }, [state.session]);

  return state;
}
