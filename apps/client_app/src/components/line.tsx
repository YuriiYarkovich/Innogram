import React from 'react';

const Line = ({
  thickness = 2,
  color = '#624b98',
}: {
  thickness?: number;
  color?: string;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '12px',
        width: '100%',
      }}
    >
      <div
        style={{
          flexGrow: 1,
          height: `${thickness}px`,
          backgroundColor: color,
        }}
      ></div>
    </div>
  );
};

export default Line;
