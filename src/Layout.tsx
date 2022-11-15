import { ReactNode, useRef } from "react";
import * as THREE from "three";

import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";

import { useControls, folder } from "leva";

import type { Camera } from "three";

type LayoutProps = {
  children?: ReactNode;
  bg: THREE.Color;
};

function Layout({ children, bg }: LayoutProps) {
  const cameraRef = useRef<Camera>();

  const [gui, setGui] = useControls(() => ({
    Layout: folder(
      {
        bg: Layout.defaultProps.bg,
        camera: folder({
          fov: 50,
          position: {
            value: [7, 4.0, 21.0],
            step: 0.1,
          },
        }),
        grid: true,
        axes: true,
      },
      { collapsed: true }
    ),
  }));
  // console.log("gui=", gui);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={gui.fov}
        ref={cameraRef}
        position={gui.position}
      />
      <OrbitControls
        camera={cameraRef.current}
        onChange={(e) => {
          setGui({ position: cameraRef.current?.position.toArray() }); // https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md#set-and-onchange
        }}
      />

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
      <ambientLight intensity={0.2} />

      {gui.grid && <gridHelper args={[30, 30, 30]} position-y="0" />}
      {gui.axes && <axesHelper args={[5]} />}

      {children}
    </>
  );
}
Layout.defaultProps = {
  bg: "#484848",
};

export default Layout;
