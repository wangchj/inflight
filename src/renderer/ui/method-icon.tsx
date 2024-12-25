import { Box } from "@mantine/core";
import { memo } from "react";

/**
 * Maps request method to color.
 */
const colorMap = new Map([
  ['DELETE',  'red'],
  ['GET',     'teal'],
  ['HEAD',    'indigo'],
  ['OPTIONS', 'blue'],
  ['PATCH',   'yellow'],
  ['POST',    'orange'],
  ['PUT',     'pink'],
]);

/**
 * Method icon component.
 */
function MethodIcon({method}: {method: string}) {
  if (!method) {
    method = '';
  }

  method = method.toUpperCase();

  return (
    <Box
      c={colorMap.get(method)}
      fz="0.7em"
      fw="600"
    >
      {method.length > 4 ? method.substring(0, 3) : method}
    </Box>
  )
}

export default memo(MethodIcon);
