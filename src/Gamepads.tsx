import * as THREE from "three";
import { useCallback, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useController, useXR } from "@react-three/xr";
import nipplejs from "nipplejs";
import { folder, useControls } from "leva";

type Vec2 = { x: number; y: number };

function Gamepads() {
  const [gui, setGui] = useControls(() => ({
    Gamepads: folder(
      {
        leftpad: { x: 0, y: 0 },
        rightpad: { x: 0, y: 0 },
        nipples: false,
        sensitivity: folder(
          {
            sensitivityLeft: { value: { x: 1 / 5, y: 1 / 5 }, label: "left" },
            sensitivityRight: {
              value: { x: 1 / 100, y: 1 / 10 },
              label: "right",
            },
          },
          { collapsed: true }
        ),
      },
      { collapsed: true }
    ),
  }));

  const leftpad = gui.leftpad;
  const setLeftpad = useCallback(
    (v: typeof leftpad) => setGui({ leftpad: v }),
    [setGui]
  );

  const rightpad = gui.rightpad;
  const setRightpad = useCallback(
    (v: typeof rightpad) => setGui({ rightpad: v }),
    [setGui]
  );

  const player = useXR((state) => state.player);

  //
  // Update `player` position and rotation
  //

  const sensitivity = {
    left: gui.sensitivityLeft,
    right: gui.sensitivityRight,
  };

  useFrame(() => {
    player.position.add(
      new THREE.Vector3(
        leftpad.x * sensitivity.left.x,
        0,
        leftpad.y * sensitivity.left.y
      ).applyEuler(player.rotation)
    );

    player.rotation.y -= rightpad.x * sensitivity.right.x;
    player.position.y -= rightpad.y * sensitivity.right.y;
  });

  return (
    <>
      <NormalGamepad setLeftpad={setLeftpad} setRightpad={setRightpad} />
      <XRGamepads setLeftpad={setLeftpad} setRightpad={setRightpad} />
      {gui.nipples && (
        <NipplesGamepads setLeftpad={setLeftpad} setRightpad={setRightpad} />
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
  setLeftpad,
  setRightpad,
}: {
  setLeftpad: (v: Vec2) => void;
  setRightpad: (v: Vec2) => void;
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

    setLeftpad({ x: threshold(gp.axes[0]), y: threshold(gp.axes[1]) });
    setRightpad({ x: threshold(gp.axes[2]), y: threshold(gp.axes[3]) });
  });

  return <></>;
}

//
// XR Gamepads (see: https://github.com/pmndrs/react-xr/issues/218)
//

function XRGamepads({
  setLeftpad,
  setRightpad,
}: {
  setLeftpad: (v: Vec2) => void;
  setRightpad: (v: Vec2) => void;
}) {
  const leftController = useController("left");
  const rightController = useController("right");

  useFrame((state, delta, XRFrame) => {
    if (!XRFrame) return;

    if (leftController) {
      const XRLeftGamepad = leftController.inputSource?.gamepad;

      setLeftpad({
        x: XRLeftGamepad?.axes[2] || 0,
        y: XRLeftGamepad?.axes[3] || 0,
      });
    }

    if (rightController) {
      const XRRightGamepad = rightController.inputSource?.gamepad;

      setRightpad({
        x: XRRightGamepad?.axes[2] || 0,
        y: XRRightGamepad?.axes[3] || 0,
      });
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
  setLeftpad,
  setRightpad,
}: {
  setLeftpad: (v: Vec2) => void;
  setRightpad: (v: Vec2) => void;
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

    manager.on("move", (evt, { identifier, position, vector }) => {
      if (evt.target.ids.length <= 1) {
        // Only one joystick
        if (position.x < size.width / 2) {
          // left part of the screen
          setLeftpad({ x: vector.x, y: -vector.y });
        } else {
          // right part of the screen
          setRightpad({ x: vector.x, y: -vector.y });
        }
      } else {
        // Two joysticks
        const otherJoystickId = evt.target.ids.find((id) => id !== identifier);
        const otherJoystick = manager.get(otherJoystickId!);

        if (position.x < otherJoystick.position.x) {
          // I'm on the left of the other joystick
          setLeftpad({ x: vector.x, y: -vector.y });
        } else {
          // I'm on the right of the other joystick
          setRightpad({ x: vector.x, y: -vector.y });
        }
      }
    });
    manager.on("end", (evt, nipple) => {
      setLeftpad({ x: 0, y: 0 });
      setRightpad({ x: 0, y: 0 });
    });

    //
    // cleanup
    //

    return () => {
      manager.destroy();
    };
  }, [gl, size, setLeftpad, setRightpad]);

  return <></>;
}
