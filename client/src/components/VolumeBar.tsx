import React from 'react';
import { VolumeBarProps } from '../utilities/props';
import { bars, getColor } from '../utilities/helpers';
import '../styles/VolumeBar.css';

const VolumeBar: React.FC<VolumeBarProps> = ({ grade }) => {
  return (
    <div className="volume-bar">
      {bars.map((index) => (
        <div
          key={index}
          className="bar"
          style={{
<<<<<<< HEAD
            height: `${(index / 10) * 100}%`,
            backgroundColor: getColor(grade, index),
=======
            height: `${(index / 12) * 100}%`,
            backgroundColor: getColor(index),
>>>>>>> 140ff99 (changes001)
          }}
        />
      ))}
    </div>
  );
};

export default VolumeBar;
