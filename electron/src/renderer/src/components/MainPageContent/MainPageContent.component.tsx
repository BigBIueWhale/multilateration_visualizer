import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OrbitControls, Plane, Box } from '@react-three/drei';
import { Slider, Box as MuiBox, Typography } from '@mui/material';
import superjson from 'superjson';

export function MainPageContent() {
  // State for the focal point position
  const [position, setPosition] = useState(new Vector3(...[0, 0, 0]));

  const handleSliderChange = (dimension: number, newValue: number) => {
    setPosition((prevPosition) => {
      const newPosition = [...prevPosition];
      newPosition[dimension] = newValue;
      return new Vector3(...newPosition);
    });
  };

  const [canvasHeight, setCanvasHeight] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      console.log(`canvasRef.current?: `, `${canvasRef.current?.offsetHeight} ${canvasRef.current?.offsetTop}`);
      const canvasHeight = canvasRef.current?.offsetTop || 0;
      const windowHeight = window.innerHeight;
      const margin = 10;
      // Adjust this calculation if there are other elements that take up vertical space
      const newCanvasHeight = Math.max(0, windowHeight - canvasHeight - margin);
      setCanvasHeight(newCanvasHeight);
    };

    // Calculate height initially and on window resize
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <MuiBox component="div" display="flex" flexDirection="column" height="100%">
      {/* Slider container */}
      <MuiBox component="div" display="flex" justifyContent="space-around" alignItems="center" p={1}>
        {(['x', 'y', 'z'] as const).map((dimension, i) => (
          <MuiBox component="div" key={dimension} width="30%">
            <Typography gutterBottom>
              {dimension.toUpperCase()}-Axis Position
            </Typography>
            <Slider
              min={-10}
              max={10}
              step={0.1}
              value={position.toArray()[i]}
              onChange={(_, newValue) => {
                  if (typeof newValue === 'number') {
                      handleSliderChange(i, newValue)
                  }
              }}
              valueLabelDisplay="auto"
              aria-labelledby="input-slider"
            />
          </MuiBox>
        ))}
      </MuiBox>

      <MuiBox ref={canvasRef} component="div" display="flex">
        {/* Adjust Canvas style to use calculated height */}
        <Canvas style={{ width: '100%', height: `${canvasHeight}px`, minHeight: '0px' }}>        {/* Ambient light to illuminate the scene */}
            <ambientLight intensity={0.5} />
            {/* Directional light for shadows */}
            <directionalLight position={[0, 10, 5]} intensity={1} />
            {/* Focal point object */}
            <Box position={position} />
            {/* Floor */}
            <Plane args={[3.0, 3.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial attach="material" color="lightgrey" />
            </Plane>
            {/* Orbit Controls */}
            <OrbitControls target={position} />
        </Canvas>
      </MuiBox>
    </MuiBox>
  );
}
