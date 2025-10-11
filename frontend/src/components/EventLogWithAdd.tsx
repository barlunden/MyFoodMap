import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api-client';
import AddLogEntry from './AddLogEntry';

interface LogEntry {
  id: string;
  type: 'meal' | 'lockdown' | 'safefood';
  date: string;
  title: string;
  description: string;
  data: any;
}

const EventLogWithAdd: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'meal' | 'lockdown' | 'safefood'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getLogs() as LogEntry[];
        setLogs(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load event logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const refreshLogs = async () => {
    try {
      const response = await apiClient.getLogs() as LogEntry[];
      setLogs(response);
      setError(null);
    } catch (err) {
      console.error('Error refreshing logs:', err);
      setError('Failed to refresh event logs');
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'lockdown':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'safefood':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'meal':
        return 'border-l-green-500 bg-green-50';
      case 'lockdown':
        return 'border-l-red-500 bg-red-50';
      case 'safefood':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'meal':
        return 'Meal Log';
      case 'lockdown':
        return 'Challenge Episode';
      case 'safefood':
        return 'Safe Food Added';
      default:
        return 'Event';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading event log...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Log</h2>
          <p className="text-gray-600 mt-1">Track meals, safe foods, and challenges</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAddForm 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showAddForm ? 'Cancel' : '+ Add Entry'}
          </button>
        </div>
      </div>

      {/* Add Log Entry Form */}
      {showAddForm && (
        <div className="mb-6">
          <AddLogEntry 
            onLogAdded={() => {
              refreshLogs();
              setShowAddForm(false);
            }} 
          />
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: 'All Events', icon: '📊' },
          { value: 'meal', label: 'Meals', icon: '🍽️' },
          { value: 'safefood', label: 'Safe Foods', icon: '✅' },
          { value: 'lockdown', label: 'Challenges', icon: '⚠️' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>

      {/* Event List */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">
            {filter === 'all'
              ? 'No events logged yet.'
              : `No ${filter} events found.`}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-lg border-l-4 ${getLogColor(log.type)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start space-x-3">
                {getLogIcon(log.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-medium">{getTypeName(log.type)}</span>
                      <span className="text-gray-500 text-sm ml-2">{formatDate(log.date)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="font-medium text-gray-900">{log.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{log.description}</p>
                  </div>

                  {/* Meal-specific details */}
                  {log.type === 'meal' && log.data && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Portion:</span>
                        <div className="text-gray-900 capitalize">{log.data.portionEaten?.replace('-', ' ')}</div>
                      </div>
                      {log.data.weightGrams && (
                        <div>
                          <span className="font-medium text-gray-600">Weight:</span>
                          <div className="text-gray-900">{log.data.weightGrams}g</div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Energy Change:</span>
                        <div className="text-gray-900">{log.data.energyBefore} → {log.data.energyAfter}</div>
                      </div>
                      {log.data.location && (
                        <div>
                          <span className="font-medium text-gray-600">Location:</span>
                          <div className="text-gray-900 capitalize">{log.data.location}</div>
                        </div>
                      )}
                      {log.data.successFactors && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-600">Success Factors:</span>
                          <div className="text-gray-900">{log.data.successFactors}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lockdown-specific details */}
                  {log.type === 'lockdown' && log.data && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      {log.data.durationMinutes && (
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span>
                          <div className="text-gray-900">{log.data.durationMinutes} minutes</div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Energy Level:</span>
                        <div className="text-gray-900">{log.data.energyLevelBefore}/5</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Family Impact:</span>
                        <div className="text-gray-900">{log.data.familyImpactLevel}/5</div>
                      </div>
                      {log.data.resolutionTimeMinutes && (
                        <div>
                          <span className="font-medium text-gray-600">Resolution Time:</span>
                          <div className="text-gray-900">{log.data.resolutionTimeMinutes} minutes</div>
                        </div>
                      )}
                      {log.data.triggers && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-600">Triggers:</span>
                          <div className="text-gray-900">{log.data.triggers}</div>
                        </div>
                      )}
                      {log.data.resolutionStrategy && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-600">Resolution Strategy:</span>
                          <div className="text-gray-900">{log.data.resolutionStrategy}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Safe food-specific details */}
                  {log.type === 'safefood' && log.data && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Category:</span>
                        <div className="text-gray-900 capitalize">{log.data.category}</div>
                      </div>
                      {log.data.dateFirstAccepted && (
                        <div>
                          <span className="font-medium text-gray-600">First Accepted:</span>
                          <div className="text-gray-900">{new Date(log.data.dateFirstAccepted).toLocaleDateString('no-NO')}</div>
                        </div>
                      )}
                      {log.data.preparationNotes && (
                        <div>
                          <span className="font-medium text-gray-600">Preparation:</span>
                          <div className="text-gray-900">{log.data.preparationNotes}</div>
                        </div>
                      )}
                      {log.data.textureNotes && (
                        <div>
                          <span className="font-medium text-gray-600">Texture:</span>
                          <div className="text-gray-900">{log.data.textureNotes}</div>
                        </div>
                      )}
                      {log.data.brandPreference && (
                        <div>
                          <span className="font-medium text-gray-600">Brand:</span>
                          <div className="text-gray-900">{log.data.brandPreference}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {log.data?.notes && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <span className="font-medium text-gray-600 text-sm">Notes:</span>
                      <p className="text-gray-700 text-sm mt-1">{log.data.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventLogWithAdd;