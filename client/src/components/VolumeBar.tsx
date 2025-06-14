import React from 'react';

const gradeColors = [
  '#fffde7', // 1: light yellow
  '#ffeb3b', // 2: yellow
  '#ffc107', // 3: orange
  '#ff9800', // 4: dark orange
  '#f44336', // 5: red
];

const VolumeBar: React.FC<{ grade: number }> = ({ grade }) => (
  <div style={{ display: 'flex', gap: 4, height: 12, marginTop: 8, marginBottom: 2 }}>
    {gradeColors.map((color, idx) => (
      <div
        key={idx}
        style={{
          flex: 1,
          background: idx < grade ? color : '#e0e0e0',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
        }}
      />
    ))}
  </div>
);

export default VolumeBar;
