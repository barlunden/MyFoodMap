import { useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import type { SafeFood, MealLog } from "../lib/api";

type ArfidStats = {
  safeFoods: SafeFood[];
  mealLogs: MealLog[];
  loading: boolean;
  error: string | null;
  averageEnergy: number | null;
  newLast30Days: number;
  successfulCount: number;
  total: number;
  successfulMealsPercent: number | null;
};

export function useArfidStats(): ArfidStats {
  const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      try {
        const [safeFoodsData, mealLogsData] = await Promise.all([
          apiClient.getSafeFoods(),
          apiClient.getMealLogs(),
        ]);
        if (isMounted){
        setSafeFoods(safeFoodsData);
        setMealLogs(mealLogsData);}
      } catch (err) {
        if (isMounted) setError("Failed to load stats");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { isMounted = false };
  }, []);

  // Beregn statistikk
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  // Successful meals siste 30 dagar
  const recentMealLogs = mealLogs.filter((log) => {
    const date = new Date(log.mealDate);
    return date >= thirtyDaysAgo && date <= now;
  });
  const successfulCount = recentMealLogs.filter(
    (m) => m.portionEaten === "all" || m.portionEaten === "most"
  ).length;

  const successfulMealsPercent =
    recentMealLogs.length > 0
      ? Math.round((successfulCount / recentMealLogs.length) * 100)
      : null;

  const total = recentMealLogs.length;

  // Average energy siste 30 dagar
  const energyValues = recentMealLogs
    .map((m) => m.energyAfter)
    .filter((e) => typeof e === "number") as number[];
  const averageEnergy =
    energyValues.length > 0
      ? Number(
          (
            energyValues.reduce((a, b) => a + b, 0) / energyValues.length
          ).toFixed(1)
        )
      : null;

  // Nye safe foods siste 30 dagar
  const newLast30Days = safeFoods.filter((sf) => {
    const created = new Date(sf.dateFirstAccepted);
    return created >= thirtyDaysAgo && created <= now;
  }).length;

  // Nye matopplevingar (kan tilpassast, her tel vi safe foods med "isNewExperience" flagg siste 30 dagar)
  // const newFoodExperiences = safeFoods.filter((sf) => {
  //  const created = new Date(sf.dateFirstAccepted);
  //  return created >= thirtyDaysAgo && created <= now && sf.isEstablishedSafeFood;
  // }).length;

  return {
    safeFoods,
    mealLogs,
    successfulCount,
    total,
    successfulMealsPercent,
    averageEnergy,
    newLast30Days,
    loading,
    error,
    /* newFoodExperiences, */
  };
}