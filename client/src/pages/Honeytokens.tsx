import { useEffect, useState } from "react";
import "../styles/Honeytokens.css";
import { Honeytoken } from "../interfaces/honeytoken";

//some fixes

function Honeytokens() {
	const [honeytokens, setHoneytokens] = useState<Honeytoken[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchHoneytokens();
	}, []);

	const fetchHoneytokens = async () => {
		try {
			const response = await fetch("http://localhost:3000/api/honeytokens");
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data: Honeytoken[] = await response.json();
			setHoneytokens(data);
		} catch (err) {
			console.error("Error fetching honeytokens:", err);
			setError("Failed to fetch honeytokens. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (token_id: string) => {
		try {
			const response = await fetch(`http://localhost:3000/api/honeytokens/${token_id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			fetchHoneytokens();
		} catch (err) {
			console.error("Error deleting honeytoken:", err);
			setError("Failed to delete honeytoken. Please try again later.");
		}
	};

	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-text">Loading honeytokens...</div>
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
		<div className="honeytokens-container">
			<h1 className="honeytokens-title">Honeytokens Dashboard</h1>
			<div className="table-container">
				<table className="honeytokens-table">
					<thead>
						<tr>
							<th>Token ID</th>
							<th>Group ID</th>
							<th>Type ID</th>
							<th>Creation Date</th>
							<th>Expire Date</th>
							<th>Notes</th>
							<th>Data</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{honeytokens.length > 0 ? (
							honeytokens.map((honeytoken) => (
								<tr key={honeytoken.token_id}>
									<td>{honeytoken.token_id}</td>
									<td>{honeytoken.group_id}</td>
									<td>{honeytoken.type_id}</td>
									<td>{new Date(honeytoken.creation_date).toLocaleString()}</td>
									<td>{new Date(honeytoken.expire_date).toLocaleString()}</td>
									<td>{honeytoken.notes}</td>
									<td>{honeytoken.data}</td>
									<td>
										<button className="delete-button" onClick={() => handleDelete(honeytoken.token_id)}>
											Delete
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={8} className="no-honeytokens">
									No honeytokens found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Honeytokens;
