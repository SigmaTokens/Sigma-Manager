import "../styles/Header.css";

function Header() {
  return (
    <header className="header">
      <nav>
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
        </ul>
      </nav>
    </header>
  );
}

export default Header;
