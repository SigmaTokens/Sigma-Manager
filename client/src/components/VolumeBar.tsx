import React from 'react';
import '../styles/VolumeBar.css';

interface Props {
  grade: number;
}

const VolumeBar: React.FC<Props> = ({ grade }) => {
  const bars = Array.from({ length: 10 }, (_, i) => i + 1);

  const getColor = (index: number): string => {
    if (grade >= 8) return index <= grade ? '#f44336' : '#e0e0e0';
    if (grade >= 5) return index <= grade ? '#ff9800' : '#e0e0e0';
    return index <= grade ? '#4caf50' : '#e0e0e0';
  };

  return (
    <div className="volume-bar">
      {bars.map((index) => (
        <div
          key={index}
          className="bar"
          style={{
            height: `${index * 6}px`,
            backgroundColor: getColor(index),
          }}
        />
      ))}
    </div>
  );
};

export default VolumeBar;
