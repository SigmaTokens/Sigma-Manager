import { useState } from "react";
import "../styles/Header.css";
import logo from "../../public/logo.png";
import CreateHoneytokenForm from "../interfaces/HoneyTokenCreation";

function Header() {
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const honeytokenTypes = [
    { id: "1", name: "text file" },
    //{ id: "2", name: "api key" },
    //{ id: "3", name: "database record" }
  ];

  return (
    <header className="header">
      <nav>
        <div>
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/honeytokens">Honeytokens</a></li>
          <li><a href="/alerts">Alerts</a></li>
          <li>
            <a onClick={() => setShowCreatePopup(true)}>
              Create
            </a>
          </li>
        </ul>
      </nav>

      {showCreatePopup && (
        <CreateHoneytokenForm
          types={honeytokenTypes}
          onClose={() => setShowCreatePopup(false)}
        />
      )}
    </header>
  );
}

export default Header;
