import { useRef, useState } from "react";
import { RigidBody, RigidBodyProps } from "@react-three/rapier";

import type { RigidBodyApi } from "@react-three/rapier";

type CubeProps = RigidBodyProps;

function Cube(props: CubeProps) {
  // const rigidBodyRef = useRef<RigidBodyApi>(null)
  const [scaleZ, setScaleZ] = useState(1);

  return (
    <RigidBody
      {...props}
      // ref={rigidBodyRef}
      //
    >
      <mesh
        castShadow
        scale-z={scaleZ}
        // onPointerEnter={(e) => setScaleZ(5)}
        // onPointerLeave={(e) => setScaleZ(1)}
        // onClick={(e) => console.log('rigidBody', rigidBodyRef.current)}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
}

export default Cube;
