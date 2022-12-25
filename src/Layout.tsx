import { ReactNode, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useController, useXR } from "@react-three/xr";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import nipplejs, { JoystickManager } from "nipplejs";

import FaceText from "./components/FaceText";

import { useControls, folder } from "leva";

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
        camera: folder({
          fov: 50,
          player: { value: [7, 4.0, 21.0], step: 0.1 }, // ~= position of the camera (the player holds the camera)
          lookAt: {
            value: [0, 0, 0],
            step: 0.1,
          },
        }),
        gamepads: folder({
          nipples: true,
        }),
      },
      { collapsed: true }
    ),
  }));
  // console.log("gui=", gui);

  return (
    <>
      <Camera position={gui.player} lookAt={gui.lookAt} fov={gui.fov} />

      <Gamepads nipples={gui.nipples} />

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

type GamepadsProps = {
  nipples: boolean;
};
function Gamepads({ nipples = true }: GamepadsProps) {
  const leftpadRef = useRef({ x: 0, y: 0 });
  const rightpadRef = useRef({ x: 0, y: 0 });

  const player = useXR((state) => state.player);

  const [text1, setText1] = useState("left");
  const [text2, setText2] = useState("right");

  //
  // Update `player` position and rotation
  //

  const sensitivity = {
    left: { x: 1 / 5, y: 1 / 5 },
    right: { x: 1 / 50, y: 1 / 10 },
  };

  useFrame(() => {
    const leftpad = leftpadRef.current;
    const rightpad = rightpadRef.current;

    setText1(`leftpad: [ ${leftpad.x.toFixed(3)}, ${leftpad.y.toFixed(3)} ]`);

    player.position.add(
      new THREE.Vector3(
        leftpad.x * sensitivity.left.x,
        0,
        leftpad.y * sensitivity.left.y
      ).applyEuler(player.rotation)
    );

    setText2(
      `rightpad: [ ${rightpad.x.toFixed(3)}, ${rightpad.y.toFixed(3)} ]`
    );
    player.rotation.y -= rightpad.x * sensitivity.right.x;
    player.position.y -= rightpad.y * sensitivity.right.y;
  });

  //
  // 🕹️ XR Gamepads (see: https://github.com/pmndrs/react-xr/issues/218)
  //

  const leftController = useController("left");
  const rightController = useController("right");

  useFrame((state, delta, XRFrame) => {
    if (XRFrame) {
      if (leftController) {
        const XRLeftGamepad = leftController.inputSource.gamepad;

        const leftpad = leftpadRef.current;
        leftpad.x = XRLeftGamepad?.axes[2] || 0;
        leftpad.y = XRLeftGamepad?.axes[3] || 0;
      }

      if (rightController) {
        const XRRightGamepad = rightController.inputSource.gamepad;

        const rightpad = rightpadRef.current;
        rightpad.x = XRRightGamepad?.axes[2] || 0;
        rightpad.y = XRRightGamepad?.axes[3] || 0;
      }
    }
  });

  //
  // 🔘 nipple gamepads
  //

  const size = 100;
  const margin = "1rem";

  useEffect(() => {
    if (!nipples) return;

    //
    // left
    //

    const managerLeft = nipplejs.create({
      mode: "static",
      size,
      position: {
        bottom: `calc(0% + ${size / 2}px + ${margin})`,
        left: `calc(0% + ${size / 2}px + ${margin})`,
      },
    });

    const leftpad = leftpadRef.current;
    managerLeft.on("move", (evt, { vector, force }) => {
      if (force > 1) return;

      leftpad.x = vector.x;
      leftpad.y = -vector.y;
    });
    managerLeft.on("end", (evt, nipple) => {
      leftpad.x = 0;
      leftpad.y = 0;
    });

    const managerRight = nipplejs.create({
      mode: "static",
      size,
      position: {
        bottom: `calc(0% + ${size / 2}px + ${margin})`,
        right: `calc(0% + ${size / 2}px + ${margin})`,
      },
    });

    //
    // right
    //

    const rightpad = rightpadRef.current;

    managerRight.on("move", (evt, { vector, force }) => {
      if (force > 1) return;

      rightpad.x = vector.x;
      rightpad.y = -vector.y;
    });
    managerRight.on("end", () => {
      rightpad.x = 0;
      rightpad.y = 0;
    });

    return () => {
      managerLeft?.destroy();
      managerRight?.destroy();
    };
  }, [nipples]);

  return (
    <>
      <FaceText position={[0, 6, 0]}>{text1}</FaceText>
      <FaceText position={[0, 5, 0]}>{text2}</FaceText>
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

  // useFrame(() => {
  //   cameraRef.current?.lookAt(...lookAt);
  // });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} fov={fov} makeDefault />
    </>
  );
}

export default Layout;
