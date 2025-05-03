import { useEffect, useState } from 'react';
import '../styles/Alerts.css'; // Assuming you have this CSS file
import { getAlerts } from '../models/Alerts'; // Assuming this path is correct

// Define the interface for an Alert object, matching the expected data structure from the server.
interface Alert {
  alert_id: string; // Unique identifier for the alert
  token_id: string; // Identifier for the honeytoken that was accessed
  alert_epoch: number; // Timestamp of the alert (expected in milliseconds)
  accessed_by: string; // Information about the user/process that accessed the token
  log: string; // Raw log data associated with the alert
  location: string; // Location information (e.g., path or description)
  file_name: string; // Name of the file accessed (if applicable)
  agent_ip: string; // IP address of the monitoring agent
  agent_port: string; // Port of the monitoring agent
  grade: number; // A numerical grade or severity level for the alert
}

// React functional component to display a table of alerts.
function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]); // State to hold the list of alerts
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(''); // State to hold any error messages

  // useEffect hook to fetch alerts when the component mounts.
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts(); // Fetch alerts using the getAlerts model function
        console.log("Fetched alerts data:", data); // Log fetched data for debugging
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setAlerts(data);
        } else {
           console.error("Fetched data is not an array:", data);
           setError("Received invalid data format from server.");
        }
      } catch (err) {
        setError('Failed to load alerts'); // Set error message on failure
        console.error('Error fetching alerts in component:', err); // Log the error
      } finally {
        setIsLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchAlerts(); // Call the fetch function

    // Optional: Set up polling to refresh alerts periodically
    // const intervalId = setInterval(fetchAlerts, 5000); // Refresh every 5 seconds
    // return () => clearInterval(intervalId); // Cleanup interval on component unmount

  }, []); // Empty dependency array means this effect runs only once on mount

  // Helper function to format the epoch timestamp into a human-readable date string.
  // Assumes epoch is in milliseconds.
  const formatDate = (epoch: number) => {
    // The Date constructor expects milliseconds.
    return new Date(epoch).toLocaleString();
  };

  // Render loading state.
  if (isLoading) {
    return <div className="loading">Loading alerts...</div>;
  }

  // Render error state.
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Render the alerts table.
  return (
    <div className="alerts-container">
      <h1 className="alerts-title">Alerts Dashboard</h1>
      <div className="table-container">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Token ID</th>
              <th>Date</th>
              <th>Accessed By</th>
              <th>File</th>
              <th>Agent</th>
              <th>Grade</th>
              {/* <th>Log</th> Add this back if you want to display the raw log */}
            </tr>
          </thead>
          <tbody>
            {alerts.length > 0 ? (
              // Map over the alerts array to create a table row for each alert.
              alerts.map((alert) => {
                // console.log("Rendering alert:", alert); // Log each alert being rendered for debugging
                // Use alert.alert_id as the key for unique identification in the list.
                return (
                  <tr key={alert.alert_id}>
                    <td>{alert.alert_id}</td>
                    <td>{alert.token_id}</td>
                    {/* Pass the epoch directly to formatDate */}
                    <td>{formatDate(alert.alert_epoch)}</td>
                    <td>{alert.accessed_by}</td>
                    {/* Display file path using location and file_name */}
                    <td>{`${alert.location || 'N/A'}/${alert.file_name || 'N/A'}`}</td> {/* Added N/A fallback */}
                    {/* Display agent info using agent_ip and agent_port */}
                    <td>{`${alert.agent_ip || 'N/A'}:${alert.agent_port || 'N/A'}`}</td> {/* Added N/A fallback */}
                    <td>{alert.grade}</td>

                    {/* If you uncomment the Log column header, uncomment this cell as well */}
                    {/* <td>{alert.log}</td> */}
                  </tr>
                );
              })
            ) : (
              // Display a message if no alerts are found.
              <tr>
                <td colSpan={7} className="no-alerts"> {/* Adjust colspan if adding Log column */}
                  No alerts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Alerts;
