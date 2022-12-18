import { KeyboardControls } from "@react-three/drei";

import { ReactNode, useMemo } from "react";

type KbdControlsProps = {
  children?: ReactNode;
};
export default function KbdControls({ children }: KbdControlsProps) {
  const map = useMemo(
    () => [
      { name: "forward", keys: ["KeyW"] },
      { name: "backward", keys: ["KeyS"] },
      { name: "leftward", keys: ["KeyA"] },
      { name: "rightward", keys: ["KeyD"] },
      { name: "jump", keys: ["Space"] },
      { name: "esc", keys: ["Escape"] },
    ],
    []
  );

  return <KeyboardControls map={map}>{children}</KeyboardControls>;
}
