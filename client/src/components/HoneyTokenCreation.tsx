import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './popup';
import '../styles/HoneyTokenCreation.css';
import { getAgents } from '../models/Agents';

function CreateHoneytokenForm({ types, onClose }: any) {
  const [quantity, setQuantity] = useState<number>(1);
  const [excludeAccess, setExcludeAccess] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [spreadAuto, setSpreadAuto] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [ComponentAddresses, setComponentAddresses] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [grade, setGrade] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [agentID, setAgentID] = useState<string>('');
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    getAgents().then((data) => {
      console.log('hui', data);
      setAgents(data);
    });
  }, []);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <Card>
          <h2 className="popup-title">Create Honeytoken</h2>

          <div className="popup-content">
            <p>
              <label>Quantity</label>
              <Input
                type="number"
                placeholder="Quantity"
                min={1}
                value={spreadAuto ? quantity : 1}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!spreadAuto}
              />
            </p>

            <p>
              <label>Type</label>
              <Select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedType(e.target.value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Honeytoken Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type: any) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </p>

            {/* <p>
              <label>Exclude Access</label>
              <Input
                type="text"
                placeholder="Exclude Access (comma-separated)"
                value={excludeAccess}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExcludeAccess(e.target.value)
                }
              />
            </p> */}

            <p>
              <label>Notes</label>
              <Input
                type="text"
                placeholder="Notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNotes(e.target.value)
                }
              />
            </p>

            <p>
              <label>File Name</label>
              <Input
                type="text"
                placeholder="Enter file name"
                value={fileName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFileName(e.target.value)
                }
              />
            </p>

            <p>
              <label>File Content</label>
              <Input
                type="text"
                placeholder="Enter the content of the file"
                value={fileContent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFileContent(e.target.value)
                }
              />
            </p>

            <p>
              <label>Grade </label>
              <small className="grade-subtitle">
                (Choose a grade between 1-10)
              </small>
              <Input
                type="number"
                min={1}
                max={10}
                value={grade}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGrade(Number(e.target.value))
                }
              />
            </p>

            <p>
              <label>Expiration Date</label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExpirationDate(e.target.value)
                }
              />
            </p>
            <p>
              <label>agent</label>
              <Select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  console.log('help:', e.target);
                  setAgentID(e.target.value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent IP" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.agent_id} value={agent.agent_id}>
                      {agent.ip}:{agent.port} | {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </p>

            {/* <p>
              <div className="checkbox-container">
                <Checkbox
                  checked={spreadAuto}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSpreadAuto(e.target.checked)
                  }
                  disabled={true}
                />
                <label>Spread Tokens Automatically</label>
              </div>
            </p> */}

            {!spreadAuto && (selectedType || types.length < 2) && (
              <p>
                <label>File Location</label>
                <div
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <Input
                    type="text"
                    placeholder="Enter file path or click to choose"
                    value={ComponentAddresses}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setComponentAddresses(e.target.value)
                    }
                  />
                </div>
              </p>
            )}
          </div>

          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Cancel
            </button>

            <button
              className="button button-primary"
              onClick={async () => {
                if (quantity === 1) {
                  try {
                    const response = await fetch(
                      'http://localhost:3000/api/honeytoken/text',
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          type: selectedType,
                          file_name: fileName,
                          location: ComponentAddresses,
                          grade: grade,
                          expiration_date: expirationDate,
                          notes: notes,
                          data: fileContent,
                          agent_id: agentID,
                        }),
                      },
                    );

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('Error:', errorText);
                      alert('Failed to create honeytoken.');
                    } else {
                      console.log('Honeytoken created successfully!');
                      onClose();
                    }
                  } catch (err) {
                    console.error('Request failed:', err);
                    alert(
                      'Something went wrong while creating the honeytoken.',
                    );
                  }
                } else {
                  //TODO: handle quantity > 1 in the future
                }
              }}
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
