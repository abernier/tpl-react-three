import { ReactNode, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useController, useXR } from "@react-three/xr";

import { Environment, PerspectiveCamera } from "@react-three/drei";

import FaceText from "./components/FaceText";

import { useControls, folder } from "leva";

function Layout({
  children,
  bg = "#393939",
}: {
  children?: ReactNode;
  bg?: string;
}) {
  const [gui] = useControls(() => ({
    Layout: folder(
      {
        bg,
        grid: true,
        axes: true,
        camera: folder({
          fov: 50,
          player: { value: [7, 4.0, 21.0], step: 0.1 }, // ~= position of the camera (the player holds the camera)
          lookAt: {
            value: [0, 0, 0],
            step: 0.1,
          },
        }),
      },
      { collapsed: true }
    ),
  }));
  // console.log("gui=", gui);

  return (
    <>
      <Camera position={gui.player} lookAt={gui.lookAt} fov={gui.fov} />

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

function Camera({
  position,
  lookAt,
  fov,
}: {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}) {
  const cameraRef = useRef<THREE.Camera>(); // non-XR camera

  const player = useXR((state) => state.player);

  //
  //  🤳 Camera (player position + cam lookAt rotation)
  //

  useEffect(() => {
    player.position.set(...position);
  }, [player, position]);

  useFrame(() => {
    cameraRef.current?.lookAt(...lookAt);
  });

  const [text1, setText1] = useState("left");
  const [text2, setText2] = useState("right");

  //
  // 🕹️ Gamepads (see: https://github.com/pmndrs/react-xr/issues/218)
  //

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

  return (
    <>
      <FaceText position={[0, 6, 0]}>{text1}</FaceText>
      <FaceText position={[0, 5, 0]}>{text2}</FaceText>

      <PerspectiveCamera ref={cameraRef} fov={fov} makeDefault />
    </>
  );
}

export default Layout;
