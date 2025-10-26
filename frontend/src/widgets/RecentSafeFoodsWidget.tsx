import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import type { SafeFood } from '../lib/api';

export default function RecentSafeFoodsWidget() {
    const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.getSafeFoods()
            .then(data => setSafeFoods(data))
            .catch(() => setError('Failed to load safe foods'))
            .finally(() => setLoading(false));
    }, []);

    // Sort by dateFirstAccepted (descending) and take the four most recent
    const recentSafeFoods = [...safeFoods]
        .sort((a, b) => new Date(b.dateFirstAccepted).getTime() - new Date(a.dateFirstAccepted).getTime())
        .slice(0, 4);

    if (loading) {
        return <p className="text-gray-500">Loading safe foods…</p>;
    }
    if (error) {
        return <p className="text-red-500">{error}</p>;
    }
    if (recentSafeFoods.length === 0) {
        return <p className="text-gray-500">No safe foods found.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentSafeFoods.map(sf => (
                <div
                    key={sf.id}
                    className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition-shadow"
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-green-800 truncate">{sf.foodName}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                {sf.category}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                            {sf.brandPreference ? <span className="font-medium">{sf.brandPreference}</span> : null}
                            {sf.brandPreference ? " • " : ""}
                            <span>
                                Accepted: <span className="font-mono">{new Date(sf.dateFirstAccepted).toLocaleDateString()}</span>
                            </span>
                        </p>
                        {sf.preparationNotes && (
                            <p className="text-xs text-gray-500 mb-2">Prep: {sf.preparationNotes}</p>
                        )}
                        {sf.notes && (
                            <p className="text-xs text-gray-400 italic">Notes: {sf.notes}</p>
                        )}
                    </div>
                    <div className="flex items-center mt-4">
                        {new Date(sf.dateFirstAccepted) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                                New
                            </span>
                        )}
                        {sf.personalRating && (
                            <span className="ml-auto text-xs text-gray-500">Rating: {sf.personalRating}/10</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}