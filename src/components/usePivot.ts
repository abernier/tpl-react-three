import { useState } from "react";

import * as THREE from "three";

import type { RigidBodyApi } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

import type { RefObject } from "react";

//
// usePivot is a custom hook that applies a linear and angular velocity to a rigid body in order to move it to the pivotControls position and rotation.
//

const linvelStrength = 20;
const angvelStrength = 20;

function usePivot(
  rigidBodyRef: RefObject<RigidBodyApi>,
  pivotControlsRef: RefObject<THREE.Object3D>,
  arrowHelperRef?: RefObject<THREE.ArrowHelper>
) {
  const [v1] = useState(new THREE.Vector3(0, 0, 0));
  const [v2] = useState(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const rigidBody = rigidBodyRef.current;
    const pivotControls = pivotControlsRef.current;
    const arrowHelper = arrowHelperRef?.current;

    if (pivotControls && rigidBody) {
      //
      // linear velocity
      //

      const a = pivotControls.localToWorld(new THREE.Vector3(0, 0, 0));
      const b = rigidBody.translation();

      v1.copy(a).sub(b);
      v2.copy(v1);

      rigidBody.setLinvel(v1.multiplyScalar(linvelStrength), true); // https://rapier.rs/docs/user_guides/javascript/rigid_bodies/#velocity

      if (arrowHelper) {
        arrowHelper.position.copy(b);
        arrowHelper.setLength(v2.length());
        arrowHelper.setDirection(v2.normalize());
      }

      //
      // angular velocity
      //

      const qb = pivotControls.getWorldQuaternion(new THREE.Quaternion());
      const qa = rigidBody.rotation();

      const qdiff = qb.multiply(qa.invert()); // quaternion "diff" https://stackoverflow.com/a/22167097/133327
      const angvel = new THREE.Euler().setFromQuaternion(qdiff);
      const angvel2 = new THREE.Vector3(angvel.x, angvel.y, angvel.z);

      rigidBody.setAngvel(angvel2.multiplyScalar(angvelStrength), true);
    }
  });
}

export default usePivot;
