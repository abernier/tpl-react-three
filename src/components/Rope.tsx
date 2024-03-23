import { Vector3 } from "three";
import {
  forwardRef,
  useRef,
  createRef,
  useState,
  type RefObject,
  type ComponentProps,
  type ElementRef,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  Sphere,
  CatmullRomLine,
  PivotControls,
  type LineProps,
} from "@react-three/drei";
import {
  RigidBody,
  useSphericalJoint,
  RapierRigidBody,
} from "@react-three/rapier";

import usePivot from "./usePivot";

//
// Rope component
//
// @see https://codesandbox.io/s/react-three-rapier-joints-mhhbd4?file=/src/Rope.tsx:581-671
//

type RopeSegmentProps = ComponentProps<typeof RigidBody>;

const RopeSegment = forwardRef<RapierRigidBody, RopeSegmentProps>(
  ({ ...props }, ref) => {
    return <RigidBody ref={ref} {...props} />;
  }
);

/**
 * We can wrap our hook in a component in order to initiate
 * them conditionally and dynamically
 */
const RopeJoint = ({
  a,
  b,
}: {
  a: RefObject<RapierRigidBody>;
  b: RefObject<RapierRigidBody>;
}) => {
  useSphericalJoint(a, b, [
    [-0.5, 0, 0],
    [0.5, 0, 0],
  ]);
  return null;
};

type RopeProps = ComponentProps<"group"> & {
  length: number;
};

const radius = 0.25;
const offset = 0.5;

export const Rope = (props: RopeProps) => {
  const groupRef = useRef<ElementRef<"group">>(null);

  const [points, setPoints] = useState<LineProps["points"]>([
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const refs = useRef(
    Array.from({ length: props.length }).map(() =>
      createRef<ElementRef<typeof RopeSegment>>()
    )
  );

  const pivotControlsRef = useRef<ElementRef<"group">>(null);
  usePivot(refs.current[0], pivotControlsRef);

  useFrame(() => {
    //
    // setPoints for CatmullRomLine
    //

    if (!groupRef.current) return;

    const points = refs.current.map(({ current: body }) => {
      const pos =
        (body && new Vector3().copy(body.translation())) || new Vector3();

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
        // segments={64}
      />

      <PivotControls ref={pivotControlsRef} scale={2} />
    </group>
  );
};
