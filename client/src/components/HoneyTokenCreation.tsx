import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Checkbox, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './popup';
import "../styles/HoneyTokenCreation.css";
import { HoneytokenPayload } from '../interfaces/HoneytokenPayload';
import { CreateHoneytokenFormProps } from '../interfaces/CreateHoneytokenFormProps';

function submitHoneytoken(payload: HoneytokenPayload, onClose: () => void): void {
    console.log('Submitting Honeytoken:', payload);
    // TODO: Replace with API call
    onClose();
}

function CreateHoneytokenForm({ types, onClose }: CreateHoneytokenFormProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const [excludeAddresses, setExcludeAddresses] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [spreadAuto, setSpreadAuto] = useState<boolean>(true);
    const [description, setDescription] = useState<string>('');
    const [ComponentAddresses, setComponentAddresses] = useState<string>('');

    return (
        <div className="overlay">
        <div className="popup-card">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-xl p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-6">Create Honeytoken</h2>

                <div className="space-y-4">
                    <p>
                    <a>Quantity<br/></a>
                    <Input
                        type="number"
                        placeholder="Quantity"
                        min={1}
                        value={spreadAuto ? quantity : 1}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
                        disabled={!spreadAuto}
                    />
                    </p>

                    <p>
                    <a>Exclude Addresses<br/></a>
                    <Textarea
                        placeholder="Exclude Addresses (comma-separated)"
                        value={excludeAddresses}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExcludeAddresses(e.target.value)}
                    />
                    </p>

                    <p>
                    <a>Type<br/></a>
                    <Select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}>
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
                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    />
                    </p>

                    <p>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={spreadAuto}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpreadAuto(e.target.checked)}
                        />
                        <span>Spread Tokens Automatically</span>
                    </div>
                    </p>
                    {!spreadAuto && (selectedType || types.length < 2) && (
                        <p>
                        <a>Locations Component for type: {selectedType}<br/></a>
                        <Textarea
                            placeholder="Component Addresses (comma-separated)"
                            value={ComponentAddresses}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComponentAddresses(e.target.value)}
                        />
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => submitHoneytoken({
                                quantity,
                                excludeAddresses,
                                selectedType,
                                spreadAuto,
                                description,
                                ComponentAddresses
                            }, onClose)}>Submit</Button>
                </div>
            </Card>
        </div>
        </div>
        </div>
    );
}

export default CreateHoneytokenForm