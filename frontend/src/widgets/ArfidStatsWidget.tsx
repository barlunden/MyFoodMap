import { useArfidStats } from "../hooks/useArfidStats";
import SuccessfulMealsWidget from "./SuccessfulMealsWidget";
import SafeFoodsWidget from "./SafeFoodsWidget";
import AverageEnergyWidget from "./AverageEnergyWidget";
import ChallengesWidget from "./ChallengesWidget";

export default function ArfidStatsWidget() {

	const {
		safeFoods,
		mealLogs,
		loading,
		error,
		successfulCount,
		total,
		averageEnergy,
		newLast30Days,
	} = useArfidStats()

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>


  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SafeFoodsWidget safeFoods={safeFoods} newLast30Days={newLast30Days} />
      <SuccessfulMealsWidget successfulCount={successfulCount} total={total} />
      <AverageEnergyWidget averageEnergy={averageEnergy} />
	  <ChallengesWidget />
    </div>
  );
}
