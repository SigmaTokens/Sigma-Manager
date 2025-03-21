import "../styles/Header.css";
import logo from "../../public/logo.png";

function Header() {
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
            <a href="/alerts">Alerts</a>
          </li>
          <li>
            <a href="/tokens">Tokens</a>
          </li>
          <li>
            <a href="/create">Create</a>
          </li>
        </ul>
        <ul>
          <li>
            <a href="/HoneyTokens">HoneyTokens</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
