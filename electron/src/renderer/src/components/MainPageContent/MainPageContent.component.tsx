import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3, DoubleSide } from 'three';
import { OrbitControls, Plane, Box } from '@react-three/drei';
import { Box as MuiBox } from '@mui/material';

export function MainPageContent() {
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [cameraTarget, setCameraTarget] = useState(new Vector3(0, 0, 0));
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
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

  const handleDoubleClick = () => {
    setCameraTarget(new Vector3(0, 0, 0));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <MuiBox component="div" display="flex" flexDirection="column" height="100%">
      <MuiBox ref={canvasRef} component="div" display="flex">
        {/* Wrap the Canvas with a div and attach onDoubleClick and onMouseDown to it */}
        <div
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          style={{ width: '100%', height: `${canvasHeight}px`, minHeight: '0px' }}
        >
          <Canvas style={{ width: '100%', height: '100%' }}>
            {/* Ambient light to illuminate the scene */}
            <ambientLight intensity={0.5} />
            {/* Directional light for shadows */}
            <directionalLight position={[0, 10, 5]} intensity={1} />
            {/* Focal point object */}
            <Box position={cameraTarget} />
            {/* Floor */}
            <Plane args={[3.0, 3.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <meshStandardMaterial side={DoubleSide} attach="material" color="lightgrey" />
            </Plane>
            {/* Orbit Controls */}
            <OrbitControls target={cameraTarget} />
          </Canvas>
        </div>
      </MuiBox>
    </MuiBox>
  );
}
