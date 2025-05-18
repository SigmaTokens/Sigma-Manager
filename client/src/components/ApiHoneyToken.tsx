import React from 'react';

const ApiHoneyToken = ({
  agentID,
  setAgentID,
  port,
  setPort,
  clearErrors,
}) => {
  return (
    <div>
      <label>Agent ID</label>
      <Input type="text" value={agentID} onChange={(e) => setAgentID(e.target.value)} />

      <label>Port</label>
      <Input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} />
    </div>
  );
};

export default ApiHoneyToken;
