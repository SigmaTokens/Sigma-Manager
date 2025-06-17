import React, { useEffect, useState } from 'react';
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './popup';
import { createHoneytokenText, createHoneytokenApi } from '../models/Honeytoken';
import { IHoneytokenType, CreateHoneytokenFormProps } from '../../../server/interfaces/agent';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { HoneytokenType } from '../utilities/typing';
import { useAgents } from '../contexts/AgentsContext';
import '../styles/HoneyTokenCreation.css';

const CreateHoneytokenForm = ({ types, onClose }: CreateHoneytokenFormProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [componentAddresses, setComponentAddresses] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [grade, setGrade] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [agentID, setAgentID] = useState<string>('');
  const [errors, setErrors] = useState<any>({});
  const [port, setPort] = useState<number>(9999);
  const [apiRows, setApiRows] = useState([{ method: 'GET', route: '', response: '' }]);
  const { agents } = useAgents();

  useEffect(() => {
    setAgentID(agents[0].agent_id || '');
  }, agents);

  const addApiRow = () => {
    setApiRows((rows) => [{ method: 'GET', route: '', response: '' }, ...rows]);
  };

  const removeApiRow = (index: number) => {
    setApiRows((rows) => rows.filter((_, i) => i !== index));
  };

  const handleApiChange = (index: number, field: string, value: string) => {
    setApiRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(apiRows);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setApiRows(items);
  };

  const validate = () => {
    const newErr: any = {};
    if (!selectedType) newErr.selectedType = true;
    if (selectedType === HoneytokenType.API) {
      if (port < 0 || port > 65535) newErr.port = true;
      apiRows.forEach((r, i) => {
        if (!/^\/[A-Za-z0-9_/:-]*$/.test(r.route)) newErr[`route${i}`] = true;
      });
    }
    setErrors(newErr);
    return !Object.keys(newErr).length;
  };

  const handleSubmit = () => {
    switch (selectedType) {
      case HoneytokenType.Text:
        handleSubmitText();
        break;
      case HoneytokenType.API:
        handleSubmitApi();
        break;
    }
  };

  const handleSubmitApi = async () => {
    try {
      const response = await createHoneytokenApi(grade, expirationDate, notes, agentID, port, apiRows);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creating honeytoken: ', errorText);
        return;
      }
      onClose();
      window.location.href = '/honeytokens';
    } catch (error) {
      console.error('error: ', error);
    }
  };

  const handleSubmitText = async () => {
    if (!validate()) return;
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
      onClose();
      window.location.href = '/honeytokens';
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong while creating the honeytoken.');
    }
  };

  return (
    <div className="overlay">
      <div className="popup-card-token" onClick={(e) => e.stopPropagation()}>
        <Card>
          <h2 className="popup-title">Create Honeytoken</h2>

          <div className="popup-content">
            <div id="type">
              <label>
                Type <span className="required-star">*</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setErrors({});
                }}
                className="select-type"
                style={{ color: selectedType ? '#000' : '#bbb' }}
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
            </div>
            <div id="this is notes">
              <label>Notes</label>
              <Input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div id="this is expiry">
              <label>
                Expiration Date <span className="required-star">*</span>
              </label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => {
                  setExpirationDate(e.target.value);
                  setErrors({});
                }}
              />
            </div>
            <div id="this is agent">
              <label>
                Agent <span className="required-star">*</span>
              </label>
              <Select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setAgentID(e.target.value);
                  setErrors({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent IP" />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter((agent) => agent.validated)
                    .map((agent) => (
                      <SelectItem key={agent.agent_id} value={agent.agent_id}>
                        {agent.agent_id} | {agent.agent_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div id="this is alert" className="alert-section">
              <label>Alert Severity </label>
              <small className="grade-subtitle">
                Set the alert severity for this honeytoken (1 = lowest, 5 = highest)
              </small>
              <input
                type="range"
                min={1}
                max={5}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className={`custom-slider grade-${grade}`}
              />
              <div className="selected-grade">Selected Grade: {grade}</div>
            </div>

            {selectedType === HoneytokenType.API && (
              <div className="api-section">
                <div id="this is port" className="field">
                  <label>
                    Port <span className="required-star">*</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={65535}
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className={errors.port ? 'input-error' : ''}
                  />
                </div>
                <div className="api-table-wrapper">
                  <div className="api-table-container">
                    <div className="api-table-scroll">
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="apiRows">
                          {(provided) => (
                            <table className="api-table" {...provided.droppableProps} ref={provided.innerRef}>
                              <thead>
                                <tr>
                                  <th>Method</th>
                                  <th>Route</th>
                                  <th>Response</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {apiRows.map((row, index) => (
                                  <Draggable key={index} draggableId={`row-${index}`} index={index}>
                                    {(prov) => (
                                      <tr ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                        <td>
                                          <select
                                            value={row.method}
                                            onChange={(e) => handleApiChange(index, 'method', e.target.value)}
                                          >
                                            {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                                              <option key={m}>{m}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            pattern="^/[A-Za-z0-9_/:-]*$"
                                            title="Must start with / and contain only letters, numbers, /, -, _, :"
                                            value={row.route}
                                            onChange={(e) => handleApiChange(index, 'route', e.target.value)}
                                            className={errors[`route${index}`] ? 'input-error' : ''}
                                            required
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={row.response}
                                            onChange={(e) => handleApiChange(index, 'response', e.target.value)}
                                          />
                                        </td>
                                        <td className="api-action-cell">
                                          <FiMinus className="api-minus-icon" onClick={() => removeApiRow(index)} />

                                          <FiPlus className="api-plus-icon" onClick={addApiRow} />
                                        </td>
                                      </tr>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </tbody>
                            </table>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedType === HoneytokenType.Text && (
              <>
                <div className="full-width-row">
                  <label>File Content</label>
                  <textarea
                    className="input"
                    placeholder="Enter the content of the file"
                    value={fileContent}
                    onChange={(e) => {
                      setFileContent(e.target.value);
                      setErrors({});
                    }}
                  />
                </div>
                <div id="this is file name">
                  <label>
                    File Name <span className="required-star">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => {
                      setFileName(e.target.value);
                      setErrors({});
                    }}
                  />
                </div>
                <div id="this is file location">
                  <label>
                    File Location <span className="required-star">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter file path"
                    value={componentAddresses}
                    onChange={(e) => {
                      setComponentAddresses(e.target.value);
                      setErrors({});
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="global-error">
              <span className="required-star">*</span> Please fill in all required fields
            </div>
          )}
          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Cancel
            </button>

            <button className="button button-primary" disabled={selectedType === ''} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateHoneytokenForm;
