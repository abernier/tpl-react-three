import { RigidBody } from "@react-three/rapier";
import { type ComponentProps } from "react";

type CubeProps = ComponentProps<typeof RigidBody> & { color?: string };

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
