import { ReactNode, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useController, useXR } from "@react-three/xr";

import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";

import FaceText from "./components/FaceText";

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
  const cameraRef = useRef<THREE.Camera>(); // non-XR camera
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  const isPresenting = useXR((state) => state.isPresenting);
  const player = useXR((state) => state.player);

  const [text1, setText1] = useState("left");
  const [text2, setText2] = useState("right");

  // https://github.com/pmndrs/react-xr/issues/218
  const leftController = useController("left");
  const rightController = useController("right");
  useFrame((state, delta, XRFrame) => {
    if (XRFrame) {
      if (leftController) {
        const leftGamePad = leftController.inputSource.gamepad;

        const x = leftGamePad?.axes[2] || 0;
        const y = leftGamePad?.axes[3] || 0;
        setText1(`left: [ ${x.toFixed(3)}, ${y.toFixed(3)} ]`);

        const lambda = 2.5;

        player.position.add(
          new THREE.Vector3(x / lambda, 0, y / lambda).applyEuler(
            player.rotation
          )
        );
      }

      if (rightController) {
        const rightGamePad = rightController.inputSource.gamepad;

        const x = rightGamePad?.axes[2] || 0;
        const y = rightGamePad?.axes[3] || 0;
        setText2(`right: [ ${x.toFixed(3)}, ${y.toFixed(3)} ]`);

        if (x) player.rotation.y -= x / 15;
        if (y) player.position.y -= y / 10;
      }
    }
  });

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

  // useEffect(() => {
  //   if (isPresenting === true) {
  //     if (cameraRef.current) {
  //       const pos = cameraRef.current.position.clone();
  //       pos.setY(0);
  //       player.position.copy(pos); // shift player instead of camera
  //     }
  //     // if (orbitControlsRef.current) {
  //     //   player.lookAt(orbitControlsRef.current.target);
  //     // }
  //   } else {
  //     player.position.set(0, 0, 0);
  //   }
  // }, [isPresenting, player]);

  return (
    <>
      <FaceText position={[0, 6, 0]}>{text1}</FaceText>
      <FaceText position={[0, 5, 0]}>{text2}</FaceText>

      <PerspectiveCamera
        ref={cameraRef}
        fov={gui.fov}
        position={gui.position}
        makeDefault={!isPresenting}
      />
      <OrbitControls
        ref={orbitControlsRef}
        camera={cameraRef.current}
        onChange={(e) => {
          setGui({ position: cameraRef.current?.position.toArray() }); // https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md#set-and-onchange
        }}
        // makeDefault
      />
    </>
  );
}

export default Layout;
