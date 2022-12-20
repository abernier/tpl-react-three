import { ReactNode, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { Text } from "@react-three/drei";

import type { Object3D } from "three";

type FaceTextProps = {
  children?: ReactNode;
  position?: [number, number, number];
};
function FaceText({ children, position, ...props }: FaceTextProps) {
  const fontProps = {
    // font: "/Inter-Regular.woff",
    font: "/RobotoMono-VariableFont_wght.ttf",
    fontSize: 0.5,
    // letterSpacing: -0.05,
    // lineHeight: 1,
    "material-toneMapped": false,
  };
  const ref = useRef<Object3D>();

  // Tie component to the render-loop
  useFrame(({ camera }) => {
    const q = new THREE.Quaternion();
    ref.current?.quaternion.copy(camera.getWorldQuaternion(q)); // Make text face the camera
  });

  return (
    <group position={position}>
      <Text ref={ref} {...props} {...fontProps} children={children} />
    </group>
  );
}

export default FaceText;
