import * as THREE from "three";
import { type ElementRef, useRef, type ComponentProps } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

type FaceTextProps = ComponentProps<typeof Text>;

function FaceText({ ...props }: FaceTextProps) {
  const fontProps = {
    font: new URL("/RobotoMono-VariableFont_wght.ttf", import.meta.url).href,
    fontSize: 0.5,
    // letterSpacing: -0.05,
    // lineHeight: 1,
    "material-toneMapped": false,
  };
  const ref = useRef<ElementRef<typeof Text>>();

  // Tie component to the render-loop
  useFrame(({ camera }) => {
    const q = new THREE.Quaternion();
    ref.current?.quaternion.copy(camera.getWorldQuaternion(q)); // Make text face the camera
  });

  return <Text ref={ref} {...props} {...fontProps} />;
}

export default FaceText;
