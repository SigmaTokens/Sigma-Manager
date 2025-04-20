import { useEffect, useState } from 'react';
import '../styles/Honeytokens.css';
import { getHoneytokens, deleteHoneytoken } from '../models/Honeytoken';

function Honeytokens() {
  const [honeytokens, setHoneytokens] = useState([]);

  useEffect(() => {
    getHoneytokens().then((data) => {
      setHoneytokens(data);
    });
  }, []);

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
              <th>Location</th>
              <th>File Name</th>
              <th>Data</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {honeytokens.length > 0 ? (
              honeytokens.map((honeytoken: any) => (
                <tr key={honeytoken.token_id}>
                  <td>{honeytoken.token_id}</td>
                  <td>{honeytoken.group_id}</td>
                  <td>{honeytoken.type_id}</td>
                  <td>{new Date(honeytoken.creation_date).toLocaleString()}</td>
                  <td>{new Date(honeytoken.expire_date).toLocaleString()}</td>
                  <td>{honeytoken.location}</td>
                  <td>{honeytoken.file_name}</td>
                  <td>{honeytoken.data}</td>
                  <td>{honeytoken.notes}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => deleteHoneytoken(honeytoken.token_id)}
                    >
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
