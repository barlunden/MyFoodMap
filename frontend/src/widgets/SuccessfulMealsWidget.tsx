import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/api";

interface MealLog {
    id: string;
    mealDate: string;
    mealType: string;
    portionEaten: string;

    // andre felt ved behov
}

export default function SuccessfulMealsWidget() {
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        apiClient.getMealLogs({
            startDate: sevenDaysAgo.toISOString(),
            endDate: now.toISOString(),
        })
            .then(setMealLogs)
            .catch(() => setError('Failed to load meal logs'))
            .finally(() => setLoading(false));
    }, []);

    // Definer vellukka måltid som måltid der alt eller mesteparten er ete
    const successfulCount = mealLogs.filter(
        m => m.portionEaten === 'all' || m.portionEaten === 'most'
    ).length;


    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Successful Meals</p>
                {loading ? (
                    <p className="text-gray-500 mt-2">Loading</p>
                ) : error ? (
                    <p className="text-red-500 mt-2">{error}</p>
                ) : (
                    <p className="text-2xl font-bold text-blue-600">
                        {successfulCount} / {mealLogs.length}
                    </p>
                )}
						</div>
						<div className="bg-blue-100 rounded-full p-3">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
							</svg>
						</div>
					</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Last 7 days</p>
        </div>
    );
}