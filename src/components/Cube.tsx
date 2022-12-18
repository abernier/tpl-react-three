import { RigidBody, RigidBodyProps } from "@react-three/rapier";

type CubeProps = RigidBodyProps;

function Cube(props: CubeProps) {
  return (
    <RigidBody {...props}>
      <mesh castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
}

export default Cube;
