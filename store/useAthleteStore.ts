import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { WellnessRecord } from "@/types/database";
import { earsEngine, EARSEngineResult } from "@/lib/ears-engine";

interface AthleteState {
  checkins: WellnessRecord[];
  engineResult: EARSEngineResult | null;
  loading: boolean;
  error: string | null;
  
  athleteSport: string | null;
  
  // Actions
  fetchCheckins: (athleteId: string, sport?: string) => Promise<void>;
  addCheckin: (checkin: Partial<WellnessRecord>) => Promise<void>;
  calculateAll: () => void;
}

export const useAthleteStore = create<AthleteState>((set, get) => ({
  checkins: [],
  engineResult: null,
  loading: false,
  error: null,
  athleteSport: null,

  fetchCheckins: async (athleteId: string, sport?: string) => {
    set({ loading: true, error: null, athleteSport: sport || null });
    try {
      const { data, error } = await supabase
        .from("wellness_records")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("record_date", { ascending: false });

      if (error) throw error;

      set({ checkins: data || [] });
      get().calculateAll();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addCheckin: async (checkin: Partial<WellnessRecord>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("wellness_records")
        .insert([checkin])
        .select();

      if (error) throw error;

      if (data) {
        set((state) => ({ checkins: [data[0], ...state.checkins] }));
        get().calculateAll();
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  calculateAll: () => {
    const { checkins } = get();
    if (checkins.length === 0) return;

    const latest = checkins[0];
    const history = checkins.slice(1);

    // Calculate ACWR (Mock for now, can be improved with real workload data)
    // Acute (7 days) / Chronic (28 days)
    const acuteLoad = checkins.slice(0, 7).reduce((acc, c) => acc + (c.readiness_score || 50), 0) / 7;
    const chronicLoad = checkins.slice(0, 28).reduce((acc, c) => acc + (c.readiness_score || 50), 0) / 28;
    const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 1.0;

    const result = earsEngine(latest, history, acwr, get().athleteSport);
    set({ engineResult: result });
  },
}));
