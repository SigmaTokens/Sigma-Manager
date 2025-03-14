import "../styles/Header.css";

function Header() {
	return (
		<header className="header">
			<nav>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="/alerts">Alerts</a>
				</li>
			</nav>
		</header>
	);
}

export default Header;
