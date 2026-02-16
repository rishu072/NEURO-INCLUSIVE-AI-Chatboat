import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  theme: string;
  accent_color: string;
  steps_per_session: number;
  timer_duration: number;
  break_reminders: boolean;
  font_preference: string;
  font_size: string;
  reduced_motion: boolean;
  high_contrast: boolean;
  streak_count: number;
  last_streak_date: string | null;
}

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
