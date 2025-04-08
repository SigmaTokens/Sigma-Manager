// Home.tsx
import React, { useState, useEffect } from 'react';
import Alerts from './Alerts';
import Honeytokens from './Honeytokens';

function Home() {
  const [alertsData, setAlertsData] = useState([]);
  const [honeytokensData, setHoneytokensData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/alerts');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAlertsData(data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to fetch alerts. Please try again later.');
      }
    };

    const fetchHoneytokens = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/honeytokens');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setHoneytokensData(data);
      } catch (err) {
        console.error('Error fetching honeytokens:', err);
        setError('Failed to fetch honeytokens. Please try again later.');
      }
    };

    Promise.all([fetchAlerts(), fetchHoneytokens()]).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <>
     
      <div className="dashboard-container" style={{ display: 'block' }}>
        <div className="card">
          <h3>Alerts Overview</h3>
          <div className="card-body">
            <Alerts data={alertsData} />
          </div>
        </div>
        <div className="card">
          <h3>Honeytokens Overview</h3>
          <div className="card-body">
            <Honeytokens data={honeytokensData} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
