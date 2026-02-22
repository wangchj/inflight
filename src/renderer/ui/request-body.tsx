import { Box, Select, Stack, useComputedColorScheme } from "@mantine/core";
import { useDispatch } from "react-redux";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import Monaco from "./monaco";
import { Request } from "types/request";

export default function RequestBody({request}: {request: Request}) {
  const colorScheme = useComputedColorScheme('dark')
  const dispatch = useDispatch();

  return (
    <Stack style={{width: '100%', height: '100%'}}>
      {/* <Box px="md" style={{flexGrow: 0, paddingBottom: '2px'}} hidden>
        <Select
          placeholder="Pick value"
          data={['None', 'JSON']}
          size="xs"
        />
      </Box> */}

      <div style={{flexGrow: 1}}>
        <Monaco
          defaultLanguage="json"
          value={request.body ?? ''}
          onChange={
            value => dispatch(workspaceSlice.actions.updateRequest({path: 'body', value}))
          }
          options={{
            minimap: {enabled: false},
            automaticLayout: true,
            wordWrap: 'on',
          }}
          theme={colorScheme === 'light' ? 'light' : 'vs-dark'}
        />
      </div>
    </Stack>
  )
}
