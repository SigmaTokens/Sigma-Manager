import { useEffect, useState } from "react";
import "../styles/honeytokens.css";
import { honeytokens } from "../interfaces/honeytokens";

function honeytokens() {
	const [alerts, setAlerts] = useState<honeytokens[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAlerts = async () => {
			try {
				const response = await fetch("http://localhost:3000/api/honeytokens");
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				const data: honeytokens[] = await response.json();
				setAlerts(data);
			} catch (err) {
				console.error("Error fetching honeytokens:", err);
				setError("Failed to fetch alerts. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchAlerts();
	}, []);

	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-text">Loading alerts...</div>
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
		<div className="alerts-container">
			<h1 className="alerts-title">Alerts Dashboard</h1>
			<div className="table-container">
				<table className="alerts-table">
					<thead>
						<tr>
							<th>Alert ID</th>
							<th>Token ID</th>
							<th>Grade</th>
							<th>Date</th>
							<th>Time</th>
							<th>Access IP</th>
							<th>Log</th>
						</tr>
					</thead>
					<tbody>
						{alerts.length > 0 ? (
							alerts.map((honeytoken) => (
								<tr key={honeytoken.getTokenID}>
									<td>{honeytoken.getTokenID}</td>
									<td>{honeytoken.getGroupID}</td>
									<td>{honeytoken.getType}</td>
									<td>{honeytoken.getCreationDate}</td>
									<td>{honeytoken.getExpirationDate}</td>
									<td>{honeytoken.isExpired}</td>
									<td>{honeytoken.getNotes}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className="no-tokens">
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

export default honeytokens;
