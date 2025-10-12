import React, { useEffect, useState } from 'react';

// Get API base URL from environment
const IS_PRODUCTION = import.meta.env.MODE === 'production';
const getApiBaseUrl = () => IS_PRODUCTION 
  ? (import.meta.env.PUBLIC_API_URL || 'https://myfoodmap-production.up.railway.app/api')
  : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api');

const ApiTest: React.FC = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API connection...');
        const response = await fetch(`${getApiBaseUrl()}/recipes`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Data:', data);
        setApiData(data);
      } catch (err) {
        console.error('API Test Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded mb-4">
      <h3 className="font-bold">API Test Component</h3>
      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : apiData ? (
        <div>
          <p className="text-green-600">✅ API Connected Successfully!</p>
          <p>Found {Array.isArray(apiData) ? apiData.length : 0} recipes</p>
          {Array.isArray(apiData) && apiData.length > 0 && (
            <p>First recipe: {apiData[0]?.title}</p>
          )}
        </div>
      ) : (
        <p>🔄 Testing API connection...</p>
      )}
    </div>
  );
};

export default ApiTest;