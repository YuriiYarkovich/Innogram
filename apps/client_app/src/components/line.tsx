import React from 'react';

const Line = ({
  thickness = 2,
  color = '#624b98',
  marginTop = 6,
  marginBottom = 0,
  paddingBottom = 0,
  paddingTop = 0,
}: {
  thickness?: number;
  color?: string;
  marginTop?: number;
  marginBottom?: number;
  paddingBottom?: number;
  paddingTop?: number;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
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
