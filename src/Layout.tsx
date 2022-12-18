import { ReactNode, useEffect, useRef } from "react";
import * as THREE from "three";
import { useXR } from "@react-three/xr";

import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";

import { useControls, folder } from "leva";

import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type LayoutProps = {
  children?: ReactNode;
  bg?: string;
};

function Layout({ children, bg = "#393939" }: LayoutProps) {
  const [gui] = useControls(() => ({
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

      {gui.grid && <gridHelper args={[30, 30, 30]} position-y=".01" />}
      {gui.axes && <axesHelper args={[5]} />}

      {children}
    </>
  );
}

function Camera() {
  const camera1Ref = useRef<THREE.Camera>(); // non-XR camera
  const camera2Ref = useRef<THREE.Camera>(); // XR camera
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  // const { camera } = useThree();
  // console.log("camera", camera.position);
  // globalThis.camera = camera;

  const isPresenting = useXR((state) => state.isPresenting);
  // console.log("isPresenting=", isPresenting);

  const player = useXR((state) => state.player);
  // console.log("player=", player);
  // globalThis.player = player;

  const [gui, setGui] = useControls(() => ({
    Layout: folder(
      {
        camera: folder({
          fov: 50,
          position: {
            value: [7, 4.0, 21.0],
            step: 0.1,
          },
        }),
      },
      { collapsed: true }
    ),
  }));
  // console.log("gui=", gui);

  useEffect(() => {
    if (isPresenting === true) {
      if (camera1Ref.current) {
        player.position.copy(camera1Ref.current.position); // shift player instead of camera
      }
    } else {
      player.position.set(0, 0, 0);
    }
  }, [isPresenting, player]);

  return (
    <>
      <PerspectiveCamera
        ref={camera2Ref}
        position={[0, 0, 0]} // always at origin -> `player` is shifted instead
        makeDefault={isPresenting}
      />
      <PerspectiveCamera
        ref={camera1Ref}
        fov={gui.fov}
        position={gui.position}
        makeDefault={!isPresenting}
      />
      <OrbitControls
        ref={orbitControlsRef}
        camera={camera1Ref.current}
        onChange={(e) => {
          setGui({ position: camera1Ref.current?.position.toArray() }); // https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md#set-and-onchange
        }}
        // makeDefault
      />
    </>
  );
}

export default Layout;
