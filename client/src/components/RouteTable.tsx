import React, { useState, useEffect } from 'react';

function RouteTable() {
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({
    method: '',
    route: '',
    result: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Fetch routes from API when the component mounts
  useEffect(() => {
    fetch('/api/routes')
      .then(response => response.json())
      .then(data => setRoutes(data));
  }, []);

  // Handle adding a new route
  const handleAddRoute = () => {
    fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoute),
    })
      .then(response => response.json())
      .then(data => {
        setRoutes([...routes, data]);
        setNewRoute({ method: '', route: '', result: '' });
      });
  };

  // Handle deleting a route
  const handleDeleteRoute = (index) => {
    const routeId = routes[index]._id;
    fetch(`/api/routes/${routeId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setRoutes(routes.filter((route, i) => i !== index));
      });
  };

  // Handle editing a route
  const handleEditRoute = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
    setNewRoute(routes[index]);
  };

  // Handle updating a route
  const handleUpdateRoute = () => {
    const routeId = routes[editingIndex]._id;
    fetch(`/api/routes/${routeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoute),
    })
      .then(response => response.json())
      .then(data => {
        setRoutes(routes.map((route, i) => i === editingIndex ? data : route));
        setIsEditing(false);
        setNewRoute({ method: '', route: '', result: '' });
      });
  };

  return (
    <div>
      <h2>Route Table</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Route</th>
            <th>Result</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route, index) => (
            <tr key={index}>
              <td>{route.method}</td>
              <td>{route.route}</td>
              <td>{route.result}</td>
              <td>
                <button onClick={() => handleDeleteRoute(index)}>Delete</button>
                <button onClick={() => handleEditRoute(index)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>{isEditing ? 'Update Route' : 'Add New Route'}</h2>
      <form>
        <label>
          Method:
          <select value={newRoute.method} onChange={(e) => setNewRoute({ ...newRoute, method: e.target.value })}>
            <option value="">Select method</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>
        <br />
        <label>
          Route:
          <input type="text" value={newRoute.route} onChange={(e) => setNewRoute({ ...newRoute, route: e.target.value })} />
        </label>
        <br />
        <label>
          Result:
          <input type="text" value={newRoute.result} onChange={(e) => setNewRoute({ ...newRoute, result: e.target.value })} />
        </label>
        <br />
        <button type="button" onClick={isEditing ? handleUpdateRoute : handleAddRoute}>
          {isEditing ? 'Update' : 'Add'}
        </button>
      </form>
    </div>
  );
}

export default RouteTable;
