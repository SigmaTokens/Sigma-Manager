import React, { useState } from "react";
import {
  Card,
  Input,
  Textarea,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./popup";
import "../styles/HoneyTokenCreation.css";
import { HoneytokenPayload } from "../interfaces/HoneytokenPayload";
import { CreateHoneytokenFormProps } from "../interfaces/CreateHoneytokenFormProps";

function submitHoneytoken(
  payload: HoneytokenPayload,
  onClose: () => void
): void {
  console.log("Submitting Honeytoken:", payload);
  // TODO: Replace with API call
  onClose();
}

function CreateHoneytokenForm({ types, onClose }: CreateHoneytokenFormProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [excludeAddresses, setExcludeAddresses] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [spreadAuto, setSpreadAuto] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [ComponentAddresses, setComponentAddresses] = useState<string>("");

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
              <label>Exclude Addresses</label>
              <Textarea
                placeholder="Exclude Addresses (comma-separated)"
                value={excludeAddresses}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setExcludeAddresses(e.target.value)
                }
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
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </p>

            <p>
              <label>Description</label>
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
              />
            </p>

            <p>
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
            </p>

            {!spreadAuto && (selectedType || types.length < 2) && (
              <p>
                <label>Locations Component for type: {selectedType}</label>
                <Textarea
                  placeholder="Component Addresses (comma-separated)"
                  value={ComponentAddresses}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setComponentAddresses(e.target.value)
                  }
                />
              </p>
            )}
          </div>

          <div className="button-container">
            <button className="button button-outline" onClick={onClose}>
              Cancel
            </button>

            <button
              className="button button-primary"
              onClick={() =>
                submitHoneytoken(
                  {
                    quantity,
                    excludeAddresses,
                    selectedType,
                    spreadAuto,
                    description,
                    ComponentAddresses,
                  },
                  onClose
                )
              }
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
