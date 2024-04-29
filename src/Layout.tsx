import * as THREE from "three";
import { type ElementRef, type ReactNode, useEffect, useRef } from "react";
import { useXR } from "@react-three/xr";
import { Environment, PerspectiveCamera } from "@react-three/drei";

import { useControls, folder } from "leva";

import Gamepads from "./Gamepads";
import { useFrame } from "@react-three/fiber";

function Layout({
  children,
  bg = "#393939",
}: {
  children?: ReactNode;
  bg?: string;
}) {
  const [gui, setGui] = useControls(() => ({
    Layout: folder(
      {
        bg,
        grid: true,
        axes: true,
      },
      { collapsed: true }
    ),
  }));
  // console.log("gui=", gui);

  return (
    <>
      <Camera />

      <Gamepads />

      <Environment background>
        <mesh scale={100}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color={gui.bg} side={THREE.BackSide} />
        </mesh>
      </Environment>

      <spotLight
        position={[15, 15, 15]}
        // angle={0.3}
        penumbra={1}
        castShadow
        intensity={2}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={1} />

      {gui.grid && <gridHelper args={[30, 30, 30]} position-y=".01" />}
      {gui.axes && <axesHelper args={[5]} />}

      {children}
    </>
  );
}

function Camera() {
  const [gui, setGui] = useControls(() => ({
    Camera: folder(
      {
        fov: 50,
        position: { value: [7, 4.0, 21.0], step: 0.1 }, // ~= position of the camera (the player holds the camera)
        lookAt: {
          value: [0, 0, 0],
          step: 0.1,
        },
      },
      { collapsed: true }
    ),
  }));

  const cameraRef = useRef<ElementRef<typeof PerspectiveCamera>>(null); // non-XR camera

  const player = useXR((state) => state.player);

  //
  //  🤳 Camera (player position + cam lookAt rotation)
  //

  useEffect(() => {
    player.position.set(...gui.position);
  }, [player, gui.position]);

  // useFrame(() => {
  //   cameraRef.current?.lookAt(...gui.lookAt);
  // });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} fov={gui.fov} makeDefault />
    </>
  );
}

export default Layout;
