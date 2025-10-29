import { useArfidStats } from "../hooks/useArfidStats";

export default function ProgressThisMonthWidget() {
  const {
    successfulMealsPercent,
    averageEnergy,
    newLast30Days,
    loading,
    error,
  } = useArfidStats();

  console.log({
    successfulMealsPercent,
    averageEnergy,
    newLast30Days,
    loading,
    error,
  });

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
		<div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Progress this month
        </h3>
      </div>
        <div className="text-2xl">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
		<div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Progress this month
        </h3>
      </div>
        <div>{error}</div>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Progress this month
        </h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-700">Successful meals</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {successfulMealsPercent !== null
              ? `${successfulMealsPercent}%`
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-700">Average energy level</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {averageEnergy !== null ? `${averageEnergy}/5` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-700">New food experiences</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {newLast30Days}
          </span>
        </div>
      </div>
    </div>
  );
}
