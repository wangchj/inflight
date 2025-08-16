import { Tooltip } from "@mantine/core";
import { useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { get } from "renderer/utils/env";

export default function VarTooltip() {
  const ui = useSelector((state: RootState) => state.ui);
  const target = ui.varTooltipTarget;
  const name = ui.varTooltipName;

  return (
    <Tooltip
      label={get(name) ?? ''}
      opened={!!target}
      target={target}
      position="bottom"

    />
  )
}
