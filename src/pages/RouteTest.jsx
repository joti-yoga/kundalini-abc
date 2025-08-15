import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

export default function RouteTest() {
  const params = useParams();
  const location = useLocation();
  
  console.log('RouteTest - useParams():', params);
  console.log('RouteTest - useLocation():', location);
  console.log('RouteTest - window.location:', window.location);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">路由測試頁面</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">useParams() 結果:</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(params, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">useLocation() 結果:</h2>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(location, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">window.location 結果:</h2>
          <pre className="bg-gray-100 p-2 rounded">
            pathname: {window.location.pathname}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">測試連結:</h2>
          <div className="space-y-2">
            <a href="/course-player/1-1" className="block text-blue-500 hover:underline">
              單一影片: /course-player/1-1
            </a>
            <a href="/course-player/1-1,2-1,3-1" className="block text-blue-500 hover:underline">
              多個影片: /course-player/1-1,2-1,3-1
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}