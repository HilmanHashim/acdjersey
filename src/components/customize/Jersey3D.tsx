import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { JerseyType, JerseyView, ZoneColors } from "./jerseyTemplates";

interface Props {
  type: JerseyType;
  view: JerseyView;
  colors: ZoneColors;
}

/* ---------- Realistic torso geometry built from a lathe profile ---------- */
function buildTorsoGeometry() {
  // Profile: half-silhouette of a t-shirt torso (x = width, y = height)
  // Goes from the hem (bottom) up to the shoulders. Lathed around Y for an oval body.
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0, -1.55),
    new THREE.Vector2(1.05, -1.5),
    new THREE.Vector2(1.08, -1.3),
    new THREE.Vector2(1.05, -0.8),
    new THREE.Vector2(1.0, -0.2),
    new THREE.Vector2(1.02, 0.4),
    new THREE.Vector2(1.08, 0.85),
    new THREE.Vector2(1.18, 1.15),
    new THREE.Vector2(1.22, 1.3),
    new THREE.Vector2(1.0, 1.4),
    new THREE.Vector2(0.5, 1.45),
    new THREE.Vector2(0.0, 1.46),
  ];
  const geo = new THREE.LatheGeometry(points, 48);
  // Squash along Z to make it oval (front-back thinner than side-side)
  geo.scale(1, 1, 0.55);
  geo.computeVertexNormals();
  return geo;
}

/* ---------- Sleeve geometry: tapered tube ---------- */
function buildSleeveGeometry(length: number, rTop: number, rEnd: number) {
  const geo = new THREE.CylinderGeometry(rEnd, rTop, length, 32, 1, false);
  geo.computeVertexNormals();
  return geo;
}

function JerseyMesh({ type, view, colors }: Props) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const target = view === "back" ? Math.PI : 0;
    group.current.rotation.y += (target - group.current.rotation.y) * 0.12;
  });

  const isLong = type === "long-sleeve";
  const isSinglet = type === "singlet";
  const isCollared = type === "collared";

  const sleeveLen = isLong ? 2.6 : isSinglet ? 0.4 : 1.05;
  const sleeveRTop = isSinglet ? 0.32 : 0.5;
  const sleeveREnd = isSinglet ? 0.28 : isLong ? 0.32 : 0.4;

  const torso = useMemo(() => buildTorsoGeometry(), []);
  const sleeveGeo = useMemo(
    () => buildSleeveGeometry(sleeveLen, sleeveRTop, sleeveREnd),
    [sleeveLen, sleeveRTop, sleeveREnd]
  );

  // Material recipe — soft fabric look
  const fabric = (color: string) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.78,
      metalness: 0,
      sheen: 0.4,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color("#ffffff"),
      clearcoat: 0.05,
    });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Torso */}
      <mesh geometry={torso} material={fabric(colors.body)} castShadow receiveShadow />

      {/* Side panels — thin curved strips along each side using torus segments */}
      <mesh position={[-1.05, -0.05, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 2.6, 0.55]} />
        <meshPhysicalMaterial
          color={colors.sidePanel}
          roughness={0.78}
          sheen={0.4}
          sheenColor={"#ffffff" as any}
        />
      </mesh>
      <mesh position={[1.05, -0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 2.6, 0.55]} />
        <meshPhysicalMaterial
          color={colors.sidePanel}
          roughness={0.78}
          sheen={0.4}
          sheenColor={"#ffffff" as any}
        />
      </mesh>

      {/* Sleeves */}
      {!isSinglet && (
        <>
          <group position={[-1.15, 1.05, 0]} rotation={[0, 0, Math.PI / 2 + 0.3]}>
            <mesh
              geometry={sleeveGeo}
              material={fabric(colors.sleeves)}
              position={[0, -sleeveLen / 2, 0]}
              castShadow
            />
          </group>
          <group position={[1.15, 1.05, 0]} rotation={[0, 0, -Math.PI / 2 - 0.3]}>
            <mesh
              geometry={sleeveGeo}
              material={fabric(colors.sleeves)}
              position={[0, -sleeveLen / 2, 0]}
              castShadow
            />
          </group>
        </>
      )}
      {isSinglet && (
        <>
          <mesh position={[-0.95, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.35, 32, 24]} />
            <primitive object={fabric(colors.sleeves)} attach="material" />
          </mesh>
          <mesh position={[0.95, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.35, 32, 24]} />
            <primitive object={fabric(colors.sleeves)} attach="material" />
          </mesh>
        </>
      )}

      {/* Collar */}
      {isCollared ? (
        // Polo collar — folded ring on top
        <group position={[0, 1.4, 0]}>
          <mesh rotation={[Math.PI / 2.6, 0, 0]} castShadow>
            <torusGeometry args={[0.42, 0.09, 16, 40, Math.PI * 1.1]} />
            <primitive object={fabric(colors.collar)} attach="material" />
          </mesh>
        </group>
      ) : (
        // Crew neck rib
        <mesh position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.42, 0.06, 16, 40]} />
          <primitive object={fabric(colors.collar)} attach="material" />
        </mesh>
      )}
    </group>
  );
}

export default function Jersey3D({ type, view, colors }: Props) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 6.5], fov: 38 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
      >
        {/* Soft studio backdrop */}
        <color attach="background" args={["#5a5a5d"]} />

        {/* Lighting rig */}
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#ffffff", "#2a2a2a", 0.55]} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 3, -2]} intensity={0.6} color="#bcd0ff" />
        <directionalLight position={[0, -3, 4]} intensity={0.25} />

        <Suspense fallback={null}>
          <JerseyMesh type={type} view={view} colors={colors} />
          <ContactShadows
            position={[0, -1.65, 0]}
            opacity={0.45}
            scale={8}
            blur={2.4}
            far={3}
          />
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
