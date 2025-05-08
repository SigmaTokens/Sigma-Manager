import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './popup';
import '../styles/HoneyTokenCreation.css';
import { getAgents } from '../models/Agents';
import { createHoneytokenText } from '../models/Honeytoken';
import TextHoneyToken from './TextHoneyToken';
import {
  IAgent,
  IHoneytokenType,
  CreateHoneytokenFormProps,
} from '../../../server/interfaces/agent';

function CreateHoneytokenForm({ types, onClose }: CreateHoneytokenFormProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [componentAddresses, setComponentAddresses] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [grade, setGrade] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [agentID, setAgentID] = useState<string>('');
  const [agents, setAgents] = useState<IAgent[]>([]);

  useEffect(() => {
    getAgents().then((data) => {
      setAgents(data);
      if (data.length > 0) setAgentID(data[0].agent_id);
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await createHoneytokenText(
        fileName,
        componentAddresses,
        grade,
        expirationDate,
        notes,
        fileContent,
        agentID,
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creating honeytoken:', errorText);
        alert('Failed to create honeytoken.');
        return;
      }
      // Close popup then redirect to dashboard
      onClose();
      window.location.href = '/honeytokens';
    } catch (err) {
      console.error('Request failed:', err);
      alert('Something went wrong while creating the honeytoken.');
    }
  };

  return (
    <div className="overlay">
      <div className="popup-card-token" onClick={(e) => e.stopPropagation()}>
        <Card>
          <h2 className="popup-title">Create Honeytoken</h2>

          <div className="popup-content">
            <p>
              <label>Quantity</label>
              <Input
                type="number"
                placeholder="Quantity"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </p>

            <p>
              <label>Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ color: selectedType === '' ? '#888' : 'black' }}
                className="select-type"
              >
                <option value="" disabled hidden>
                  Select Honeytoken Type
                </option>
                {types.map((type: IHoneytokenType) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </p>

            <p>
              <label>Notes</label>
              <Input
                type="text"
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </p>

            {selectedType === 'text' && (
              <TextHoneyToken
                fileName={fileName}
                setFileName={setFileName}
                fileContent={fileContent}
                setFileContent={setFileContent}
                fileLocation={componentAddresses}
                setFileLocation={setComponentAddresses}
              />
            )}

            <p>
              <label>Grade</label>
              <small className="grade-subtitle">
                (Choose a grade between 1-10)
              </small>
              <Input
                type="number"
                min={1}
                max={10}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
              />
            </p>

            <p>
              <label>Expiration Date</label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </p>

            <p>
              <label>Agent</label>
              <Select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setAgentID(e.target.value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent IP" />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((agent) => agent.validated)
                    .map((agent) => (
                      <SelectItem key={agent.agent_id} value={agent.agent_id}>
                        {agent.agent_ip}:{agent.agent_port} | {agent.agent_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </p>
          </div>

          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Cancel
            </button>

            <button
              className="button button-primary"
              disabled={selectedType === ''}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CreateHoneytokenForm;
