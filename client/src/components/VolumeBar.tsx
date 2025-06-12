import React from 'react';
import '../styles/VolumeBar.css';

interface Props {
  grade: number;
}

const VolumeBar: React.FC<Props> = ({ grade }) => {
  const bars = Array.from({ length: 5 }, (_, i) => i + 1);

  const getColor = (index: number): string => {
    if (grade >= index) {
      if (grade === 5) return '#f44336'; // red
      if (grade >= 3 && grade <= 4) return '#ff9800'; // yellow
      return '#4caf50'; // green
    }
    return '#e0e0e0'; // gray
  };

  return (
    <div className="volume-bar">
      {bars.map((index) => (
        <div
          key={index}
          className="bar"
          style={{
            height: `${(index / 5) * 100}%`,
            backgroundColor: getColor(index),
          }}
        />
      ))}
    </div>
  );
};

export default VolumeBar;
