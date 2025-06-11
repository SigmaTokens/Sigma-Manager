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
            height: `${index * 6}px`,
            backgroundColor: getColor(grade, index),
          }}
        />
      ))}
    </div>
  );
};

export default VolumeBar;
