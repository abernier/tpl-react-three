import { useMemo } from "react";
import styled from "@emotion/styled";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Physics, Debug, RigidBody } from "@react-three/rapier";
import { VRButton, XR } from "@react-three/xr";

import Layout from "./Layout";
import Cube from "./components/Cube";
import Ball from "./components/Ball";
import Ground from "./components/Ground";

function App() {
  const map = useMemo(
    () => [
      { name: "forward", keys: ["KeyW"] },
      { name: "backward", keys: ["KeyS"] },
      { name: "leftward", keys: ["KeyA"] },
      { name: "rightward", keys: ["KeyD"] },
      { name: "jump", keys: ["Space"] },
    ],
    []
  );

  return (
    <Styled>
      <KeyboardControls map={map}>
        <VRButton />
        <Canvas shadows>
          <XR>
            <Physics
              gravity={[0, -60, 0]}
              // timeStep={1 / 60}
              //
            >
              <Debug />

              <Layout>
                <Scene />
              </Layout>
            </Physics>
          </XR>
        </Canvas>
      </KeyboardControls>
    </Styled>
  );
}
export const Styled = styled.div`
  position: fixed;
  inset: 0;
`;
export default App;

function Scene() {
  return (
    <>
      <Cube position-y={1} />
      <Ball />

      <Ground />
    </>
  );
}
