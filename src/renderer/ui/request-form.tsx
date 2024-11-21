import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  Title
} from "@mantine/core";
import { useState } from "react";
import { Request } from "types/request"
import RequestConfig from "./request-config";
import RequestOutput from "./request-output";

interface RequestFormProps {
  request: Request;
}

export default function RequestForm({request}: RequestFormProps) {
  const [selectedTab, setSelectedTab] = useState<string>('Config');
  const [output, setOutput] = useState<string>();

  async function onSendClick() {
    const resp = await window.sendRequest(request);
    console.log(resp);
  }

  return (
    <Stack>
      {/* URL bar */}
      <Group grow preventGrowOverflow={false}>
          <Select
            // style={{flexGrow: 0, flexShrink: 1}}
            data={['GET', 'POST']}
            value={request.method}
            style={{flexGrow: 0, width: '100px'}}
          />
        <TextInput
          style={{flexGrow: 1}}
          value={request.url}
        />
        <Button
          style={{flexGrow: 0, flexShrink: 1}}
          onClick={onSendClick}
        >
          Send
        </Button>
      </Group>

      <Box>
        <SegmentedControl
          data={['Config', 'Output']}
          value={selectedTab}
          onChange={setSelectedTab}
        />
      </Box>

      {selectedTab === 'Output' ? <RequestOutput/> : <RequestConfig request={request}/>}

    </Stack>
  )
}
