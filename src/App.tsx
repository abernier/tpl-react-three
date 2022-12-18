import { useEffect } from "react";
import styled from "@emotion/styled";
import { Canvas, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { Physics, Debug } from "@react-three/rapier";
import { XRButton, XR, Controllers, Hands, VRButton } from "@react-three/xr";

import Layout from "./Layout";
import Cube from "./components/Cube";
import Ball from "./components/Ball";
import Ground from "./components/Ground";

function App() {
  return (
    <Styled>
      <VRButton />
      <Canvas
        shadows
        // camera={{
        //   position: [0, 15, 5],
        //   fov: 55,
        // }}
        //
      >
        <XR>
          <Controllers />
          <Hands />

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
    </Styled>
  );
}
export const Styled = styled.div`
  position: fixed;
  inset: 0;
`;
export default App;

function Scene() {
  //
  // ESC key to exit XR
  //

  const { gl } = useThree();
  const escPressed = useKeyboardControls((state) => state.esc);
  useEffect(() => {
    gl.xr.getSession()?.end(); // https://stackoverflow.com/a/71566927/133327
  }, [escPressed]);

  return (
    <>
      <Cube position-y={1} />
      <Ball />

      <Ground />
    </>
  );
}
