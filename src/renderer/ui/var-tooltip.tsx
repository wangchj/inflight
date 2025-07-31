import { Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
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
