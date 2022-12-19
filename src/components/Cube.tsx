import * as THREE from "three";

import { RigidBody, RigidBodyProps } from "@react-three/rapier";

type CubeProps = { color?: string } & RigidBodyProps;

function Cube({ color = "blue", ...props }: CubeProps) {
  return (
    <RigidBody {...props}>
      <mesh castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

export default Cube;
