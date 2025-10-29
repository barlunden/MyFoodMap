import React from 'react';
import type { SafeFood } from '../lib/api';

type SafeFoodsWidgetProps = {
  safeFoods: SafeFood[];
  newLast30Days: number;
};

export default function SafeFoodsWidget({ safeFoods, newLast30Days }: SafeFoodsWidgetProps) {
	return (

		<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Safe Foods</p>
							<p className="text-2xl font-bold text-green-600">{safeFoods.length}</p>
						</div>
						<div className="bg-green-100 rounded-full p-3">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-xs text-gray-500">+{newLast30Days} new this month</p>
					</div>
				</div>
)}