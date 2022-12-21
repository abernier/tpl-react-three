import { useFrame } from "@react-three/fiber";
import { Sphere, CatmullRomLine, PivotControls } from "@react-three/drei";
import {
  RigidBodyApi,
  RigidBody,
  RigidBodyApiRef,
  useSphericalJoint,
} from "@react-three/rapier";
import { forwardRef, ReactNode, useRef, createRef, useState } from "react";
import { Vector3 } from "three";

import usePivot from "./usePivot";

import type { GroupProps } from "@react-three/fiber";
import type { LineProps } from "@react-three/drei";
import type { RigidBodyProps } from "@react-three/rapier";

//
// Rope component
//
// @see https://codesandbox.io/s/react-three-rapier-joints-mhhbd4?file=/src/Rope.tsx:581-671
//

type RopeSegmentProps = RigidBodyProps & {
  children: ReactNode;
};

const RopeSegment = forwardRef<RigidBodyApi, RopeSegmentProps>(
  ({ children, ...rest }, ref) => {
    return (
      <RigidBody ref={ref} {...rest}>
        {children}
      </RigidBody>
    );
  }
);

/**
 * We can wrap our hook in a component in order to initiate
 * them conditionally and dynamically
 */
const RopeJoint = ({ a, b }: { a: RigidBodyApiRef; b: RigidBodyApiRef }) => {
  useSphericalJoint(a, b, [
    [-(radius + offset), 0, 0],
    [radius + offset, 0, 0],
  ]);
  return null;
};

interface RopeProps extends GroupProps {
  length: number;
}

const radius = 0.25;
const offset = 0.5;

export const Rope = (props: RopeProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const [points, setPoints] = useState<LineProps["points"]>([
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const refs = useRef(
    Array.from({ length: props.length }).map(() => createRef<RigidBodyApi>())
  );

  const pivotControlsRef = useRef<THREE.Group>(null);
  usePivot(refs.current[0], pivotControlsRef);

  useFrame(() => {
    //
    // setPoints for CatmullRomLine
    //

    if (!groupRef.current) return;

    const points = refs.current.map(({ current: body }) => {
      const pos = body?.translation().clone() || new Vector3();

      return groupRef.current!.worldToLocal(pos);
    });

    setPoints(points);
  });

  return (
    <group ref={groupRef} {...props}>
      {refs.current.map((ref, i) => (
        <RopeSegment
          ref={ref}
          key={i}
          position={[i * 2 * (radius + offset), 0, 0]}
          // type={i === 0 ? "kinematicPosition" : "dynamic"}
          type="dynamic"
          colliders="ball"
        >
          <Sphere args={[radius]} castShadow>
            <meshStandardMaterial />
          </Sphere>
        </RopeSegment>
      ))}
      {/**
       * Multiple joints can be initiated dynamically by
       * mapping out wrapped components containing the hooks
       */}
      {refs.current.map(
        (ref, i) =>
          i > 0 && (
            <RopeJoint a={refs.current[i]} b={refs.current[i - 1]} key={i} />
          )
      )}

      <CatmullRomLine
        points={points} // Array of Points
        color="#ec36a0"
        lineWidth={3} // In pixels (default)
        segments={64}
      />

      <PivotControls ref={pivotControlsRef} scale={2} />
    </group>
  );
};
