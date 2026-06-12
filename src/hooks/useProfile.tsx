import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";

import { useAuth } from "./useAuth";

export type { UserProfile };

/**
 * Fetches and exposes the current user's profile from Supabase.
 * Re-exports `UserProfile` so existing imports continue to work unchanged.
 *
 * @returns `profile`, `loading`, `updateProfile`, and `refetch`.
 */
export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Persists a partial profile update to Supabase and refreshes local state.
   *
   * @param updates - Partial `UserProfile` fields to overwrite.
   * @returns The Supabase `{ data, error }` result.
   */
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
      return { data, error };
    },
    [user]
  );

  return { profile, loading, updateProfile, refetch: fetchProfile };
};
