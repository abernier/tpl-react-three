import { type ComponentProps, useMemo } from "react";
import { KeyboardControls } from "@react-three/drei";

type KbdControlsProps = Omit<ComponentProps<typeof KeyboardControls>, "map">;

export default function KbdControls(props: KbdControlsProps) {
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

  return <KeyboardControls {...props} map={map} />;
}
