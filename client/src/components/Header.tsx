import { useEffect, useState } from "react";
import "../styles/Header.css";
import logo from "../assets/logo.png";
import CreateHoneytokenForm from "./HoneyTokenCreation";

function useAgents() {
	const [agents, setAgents] = useState([]);

	useEffect(() => {
		async function fetchAgents() {
			try {
				const response = await fetch("http://localhost:3000/api/agents", {
					method: "GET",
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error:", errorText);
					alert("Failed to fetch agents.");
				} else {
					const data = await response.json();
					setAgents(data);
				}
			} catch (err) {
				console.error("Request failed:", err);
				alert("Something went wrong while fetching agents.");
			}
		}

		fetchAgents();
	}, []);

	return agents;
}

function Header() {
	const [showCreatePopup, setShowCreatePopup] = useState(false);

	const honeytokenTypes = [
		{ id: "1", name: "text file" },
		// { id: "2", name: "api key" },
		// { id: "3", name: "database record" }
	];
	const agents = useAgents();

	return (
		<header className="header">
			<nav>
				<div>
					<img src={logo} alt="Logo" className="logo" />
				</div>
				<ul>
					<li>
						<a href="/">Home</a>
					</li>
					<li>
						<a href="/honeytokens">Honeytokens</a>
					</li>
					<li>
						<a href="/alerts">Alerts</a>
					</li>
					<li>
						<a onClick={() => setShowCreatePopup(true)}>Create</a>
					</li>
				</ul>
			</nav>

			{showCreatePopup && <CreateHoneytokenForm types={honeytokenTypes} agents={agents} onClose={() => setShowCreatePopup(false)} />}
		</header>
	);
}

export default Header;
