import React, { useState, useRef, useEffect, useContext } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Vector3, DoubleSide, ColorRepresentation, LineSegments, BufferGeometry, Float32BufferAttribute, LineBasicMaterial } from 'three';
import { OrbitControls, Plane, Box } from '@react-three/drei';
import { Box as MuiBox } from '@mui/material';
import { FrameDataReadContext } from 'renderer/src/Context/FrameData.context';
import { FrameData } from "../../../../shared/src/proto/grpc_api";

function Grid(props: { size: number | undefined, divisions: number | undefined, colorCenterLine: ColorRepresentation | undefined, colorGrid: ColorRepresentation | undefined }) {
  const { scene } = useThree();
  useEffect(() => {
    const size = props.size || 10;
    const divisions = props.divisions || 10;
    const centerLineColor = props.colorCenterLine || 0xff0000;
    const gridColor = props.colorGrid || 0xffffff;

    const gridGeometry = new BufferGeometry();
    const points = [];

    // Create grid lines
    for (let i = -size / 2; i <= size / 2; i += size / divisions) {
      points.push(i, 0, -size / 2, i, 0, size / 2);
      points.push(-size / 2, 0, i, size / 2, 0, i);
    }

    gridGeometry.setAttribute('position', new Float32BufferAttribute(points, 3));

    const centerLineMaterial = new LineBasicMaterial({ color: centerLineColor, linewidth: 2 });
    const gridMaterial = new LineBasicMaterial({ color: gridColor, linewidth: 1 });

    const centerLines = new LineSegments(gridGeometry, centerLineMaterial);
    const gridLines = new LineSegments(gridGeometry, gridMaterial);

    centerLines.rotateY(-Math.PI / 2);
    gridLines.rotateY(-Math.PI / 2);

    scene.add(centerLines);
    scene.add(gridLines);

    return () => {
      scene.remove(centerLines);
      scene.remove(gridLines);
    };
  }, [props, scene]);

  return null;
}

export function MainPageContent() {
  const frameDataReadContext = useContext(FrameDataReadContext);
  const frameData: FrameData = frameDataReadContext.frameData;

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
          <Canvas
            style={{ width: '100%', height: '100%' }}
            camera={{
              position: [0, 20, 40],
              fov: 50,
              near: 1,
              far: 1000,
            }}>
            {/* Ambient light to illuminate the scene */}
             <ambientLight intensity={0.5} />
            {/* Directional light for shadows */}
             <directionalLight position={[0, 128, 60]} intensity={1} />
            {/* Focal point object */}
             <Box position={cameraTarget} args={[7, 7, 7]} />
            {/* Floor with semi-transparency for nicer appearance and measurement aid */}
            <Plane args={[128.0, 128.0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <meshBasicMaterial side={DoubleSide} attach="material" color="gold" transparent opacity={0.3} depthWrite={false} />            </Plane>
            {/* Ruler-type Grid for easier visual measurements */}
            <Grid size={128} divisions={32} colorCenterLine="red" colorGrid="#6497b1" />
            {/* Voxels */}
            {frameData.voxels.map((voxel, index) => (
              <Box
                key={index}
                position={[voxel.x - 0.5, voxel.y - 0.5, voxel.z - 0.5]}
                args={[1, 1, 1]}
                castShadow
                receiveShadow={false}
              >
                <meshStandardMaterial
                  attach="material"
                  color={voxel.color}
                  transparent
                  opacity={voxel.opacity}
                  depthWrite={false}
                />
              </Box>
            ))}
            {/* Camera travels in sphere around focal point */}
            <OrbitControls
              target={cameraTarget}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={200}
            />
          </Canvas>
        </div>
      </MuiBox>
    </MuiBox>
  );
}
