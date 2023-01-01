import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useController, useXR } from "@react-three/xr";
import nipplejs from "nipplejs";

import FaceText from "./components/FaceText";

type Vec2 = { x: number; y: number };

type GamepadsProps = {
  nipples: boolean;
};
function Gamepads({ nipples = true }: GamepadsProps) {
  const leftpadRef = useRef<Vec2>({ x: 0, y: 0 });
  const rightpadRef = useRef<Vec2>({ x: 0, y: 0 });

  const player = useXR((state) => state.player);

  const [text1, setText1] = useState("left");
  const [text2, setText2] = useState("right");

  //
  // Update `player` position and rotation
  //

  const sensitivity: { left: Vec2; right: Vec2 } = {
    left: { x: 1 / 5, y: 1 / 5 },
    right: { x: 1 / 100, y: 1 / 10 },
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

  return (
    <>
      <FaceText position={[0, 6, 0]}>{text1}</FaceText>
      <FaceText position={[0, 5, 0]}>{text2}</FaceText>

      <NormalGamepad leftpadRef={leftpadRef} rightpadRef={rightpadRef} />
      <XRGamepads leftpadRef={leftpadRef} rightpadRef={rightpadRef} />
      {nipples && (
        <NipplesGamepads leftpadRef={leftpadRef} rightpadRef={rightpadRef} />
      )}
    </>
  );
}

export default Gamepads;

//
// 🕹️ Normal gamepad
//
// https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
//

function NormalGamepad({
  leftpadRef,
  rightpadRef,
}: {
  leftpadRef: React.MutableRefObject<Vec2>;
  rightpadRef: React.MutableRefObject<Vec2>;
}) {
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);

  useEffect(() => {
    const onConnect = (e: GamepadEvent) => {
      console.log("gamepadconnected");
      const gp = navigator.getGamepads()[e.gamepad.index];
      if (!gp) return;

      console.log("gp", gp);
      setGamepadIndex(gp.index);

      console.log(
        `Gamepad connected at index ${gp.index}: ${gp.id} with ${gp.buttons.length} buttons, ${gp.axes.length} axes.`
      );
    };
    window.addEventListener("gamepadconnected", onConnect);

    return () => {
      console.log("gamepaddisconnected");
      setGamepadIndex(null);
      window.removeEventListener("gamepadconnected", onConnect);
    };
  }, []);

  const threshold = (x: number, min = 0.1) => (Math.abs(x) > min ? x : 0);

  useFrame(() => {
    if (gamepadIndex === null) return;

    const gp = navigator.getGamepads()[gamepadIndex];
    if (!gp) return;

    const leftpad = leftpadRef.current;
    leftpad.x = threshold(gp.axes[0]);
    leftpad.y = threshold(gp.axes[1]);

    const rightpad = rightpadRef.current;
    rightpad.x = threshold(gp.axes[2]);
    rightpad.y = threshold(gp.axes[3]);
  });

  return <></>;
}

//
// XR Gamepads (see: https://github.com/pmndrs/react-xr/issues/218)
//

function XRGamepads({
  leftpadRef,
  rightpadRef,
}: {
  leftpadRef: React.MutableRefObject<Vec2>;
  rightpadRef: React.MutableRefObject<Vec2>;
}) {
  const leftController = useController("left");
  const rightController = useController("right");

  useFrame((state, delta, XRFrame) => {
    if (!XRFrame) return;

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
  });

  return <></>;
}

//
// 🔘 nipple gamepads
//
// see: https://yoannmoi.net/nipplejs/
//

function NipplesGamepads({
  leftpadRef,
  rightpadRef,
}: {
  leftpadRef: React.MutableRefObject<Vec2>;
  rightpadRef: React.MutableRefObject<Vec2>;
}) {
  const { size, gl } = useThree();

  useEffect(() => {
    const manager = nipplejs.create({
      zone: gl.domElement.parentNode as HTMLElement,
      mode: "dynamic",
      multitouch: true,
      maxNumberOfNipples: 2,
      size: 100,
    });

    const leftpad = leftpadRef.current;
    const rightpad = rightpadRef.current;
    manager.on("move", (evt, { identifier, position, vector }) => {
      if (evt.target.ids.length <= 1) {
        // Only one joystick
        if (position.x < size.width / 2) {
          // left part of the screen
          leftpad.x = vector.x;
          leftpad.y = -vector.y;
        } else {
          // right part of the screen
          rightpad.x = vector.x;
          rightpad.y = -vector.y;
        }
      } else {
        // Two joysticks
        const otherJoystickId = evt.target.ids.find((id) => id !== identifier);
        const otherJoystick = manager.get(otherJoystickId!);

        if (position.x < otherJoystick.position.x) {
          // I'm on the left of the other joystick
          leftpad.x = vector.x;
          leftpad.y = -vector.y;
        } else {
          // I'm on the right of the other joystick
          rightpad.x = vector.x;
          rightpad.y = -vector.y;
        }
      }
    });
    manager.on("end", (evt, nipple) => {
      leftpad.x = 0;
      leftpad.y = 0;
      rightpad.x = 0;
      rightpad.y = 0;
    });

    //
    // cleanup
    //

    return () => {
      manager.destroy();
    };
  }, [gl, size, leftpadRef, rightpadRef]);

  return <></>;
}
