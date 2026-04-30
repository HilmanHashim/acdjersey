import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { JerseyType, JerseyView, ZoneColors } from "./jerseyTemplates";

interface Props {
  type: JerseyType;
  view: JerseyView;
  colors: ZoneColors;
}

function JerseyMesh({ type, view, colors }: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const target = view === "back" ? Math.PI : 0;
    group.current.rotation.y += (target - group.current.rotation.y) * 0.15;
  });

  const isLong = type === "long-sleeve";
  const isSinglet = type === "singlet";
  const isCollared = type === "collared";

  const sleeveLen = isLong ? 2.6 : isSinglet ? 0.35 : 1.1;
  const sleeveRadius = isSinglet ? 0.22 : 0.32;

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.1, 2.8, 0.7]} />
        <meshStandardMaterial color={colors.body} roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Side panels */}
      <mesh position={[-1.02, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 2.8, 0.72]} />
        <meshStandardMaterial color={colors.sidePanel} roughness={0.55} />
      </mesh>
      <mesh position={[1.02, 0, 0]} castShadow>
        <boxGeometry args={[0.18, 2.8, 0.72]} />
        <meshStandardMaterial color={colors.sidePanel} roughness={0.55} />
      </mesh>

      {/* Sleeves */}
      {!isSinglet && (
        <>
          <mesh
            position={[-1.15 - sleeveLen / 2.4, 1.1, 0]}
            rotation={[0, 0, Math.PI / 2 + 0.25]}
            castShadow
          >
            <cylinderGeometry args={[sleeveRadius, sleeveRadius * 1.15, sleeveLen, 24]} />
            <meshStandardMaterial color={colors.sleeves} roughness={0.55} />
          </mesh>
          <mesh
            position={[1.15 + sleeveLen / 2.4, 1.1, 0]}
            rotation={[0, 0, -Math.PI / 2 - 0.25]}
            castShadow
          >
            <cylinderGeometry args={[sleeveRadius, sleeveRadius * 1.15, sleeveLen, 24]} />
            <meshStandardMaterial color={colors.sleeves} roughness={0.55} />
          </mesh>
        </>
      )}
      {isSinglet && (
        <>
          <mesh position={[-0.95, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.32, 24, 16]} />
            <meshStandardMaterial color={colors.sleeves} roughness={0.55} />
          </mesh>
          <mesh position={[0.95, 1.25, 0]} castShadow>
            <sphereGeometry args={[0.32, 24, 16]} />
            <meshStandardMaterial color={colors.sleeves} roughness={0.55} />
          </mesh>
        </>
      )}

      {/* Collar */}
      {isCollared ? (
        <mesh position={[0, 1.5, 0.15]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
          <torusGeometry args={[0.45, 0.1, 16, 32, Math.PI]} />
          <meshStandardMaterial color={colors.collar} roughness={0.5} />
        </mesh>
      ) : (
        <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.45, 0.07, 16, 32]} />
          <meshStandardMaterial color={colors.collar} roughness={0.5} />
        </mesh>
      )}

      {/* Hem */}
      <mesh position={[0, -1.45, 0]} castShadow>
        <boxGeometry args={[2.15, 0.1, 0.74]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function Jersey3D({ type, view, colors }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 7], fov: 38 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} />
        <hemisphereLight args={["#ffffff", "#444444", 0.4]} />
        <Suspense fallback={null}>
          <JerseyMesh type={type} view={view} colors={colors} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
