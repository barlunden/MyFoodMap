import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import type { SafeFood } from '../lib/api';
import SuccessfulMealsWidget from './SuccessfulMealsWidget';



export default function ArfidStatsWidget() {
    const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiClient.getSafeFoods();
                setSafeFoods(data);
            } catch (err) {
                setError('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats()
    }, []);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30 );

    const newLast30Days = safeFoods.filter(sf => {
        const created = new Date(sf.dateFirstAccepted);
        return created >= thirtyDaysAgo && created <= now;
    }).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Safe Foods</p>
							<p className="text-2xl font-bold text-green-600">{safeFoods.length}</p>
						</div>
						<div className="bg-green-100 rounded-full p-3">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-xs text-gray-500">+{newLast30Days} new this month</p>
					</div>
				</div>

				{/* <div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Successful Meals</p>
							<p className="text-2xl font-bold text-blue-600">18/21</p>
						</div>
						<div className="bg-blue-100 rounded-full p-3">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-xs text-gray-500">Last 7 days</p>
					</div>
				</div> */}

				<SuccessfulMealsWidget />

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Average Energy Level</p>
							<p className="text-2xl font-bold text-purple-600">3.8/5</p>
						</div>
						<div className="bg-purple-100 rounded-full p-3">
							<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-xs text-gray-500">After meals this week</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Challenges</p>
							<p className="text-2xl font-bold text-orange-600">2</p>
						</div>
						<div className="bg-orange-100 rounded-full p-3">
							<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-xs text-gray-500">Last 7 days</p>
					</div>
				</div>
			</div>
    )
}

