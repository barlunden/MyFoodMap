import React from "react";

type SuccessfulMealsWidgetProps = {
    successfulCount: number;
    total: number;
}

interface MealLog {
    id: string;
    mealDate: string;
    mealType: string;
    portionEaten: string;

    // andre felt ved behov
}

export default function SuccessfulMealsWidget({ successfulCount, total }: SuccessfulMealsWidgetProps) {

    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Successful Meals</p>
                
                    <p className="text-2xl font-bold text-blue-600">
                        {successfulCount} / {total}
                    </p>
                
						</div>
						<div className="bg-blue-100 rounded-full p-3">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
							</svg>
						</div>
					</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Last 7 days</p>
        </div>
    );
}