import {
  Box,
  Tabs,
} from "@mantine/core";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";

export default function RequestOutput() {
  const [selectedTab, setSelectedTab] = useState<string>('body');
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequest = workspace.openedRequests[workspace.selectedRequestIndex];

  return (
    <Tabs
      value={selectedTab}
      onChange={value => value === null ? null : setSelectedTab(value)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs.List
        style={{
          flexGrow: 0,
        }}
      >
        <Tabs.Tab value="request_headers">Request headers</Tabs.Tab>
        <Tabs.Tab value="response_headers">Response headers</Tabs.Tab>
        <Tabs.Tab value="body">Body</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        key={`${openedRequest.id}_request_headers`}
        value="request_headers"
        style={{flexGrow: 1}}
      >
        <Box pt="md">
          Request headers
        </Box>
      </Tabs.Panel>

      <Tabs.Panel
        key={`${openedRequest.id}_response_headers`}
        value="response_headers"
        style={{flexGrow: 1}}
      >
        <Box pt="md" h="100%">
          Response headers
        </Box>
      </Tabs.Panel>

      <Tabs.Panel
        key={`${openedRequest.id}_response_body`}
        value="body"
        style={{flexGrow: 1}}
      >
        <Box pt="md" style={{maxWidth: '500px'}}>
          Response body
        </Box>
      </Tabs.Panel>
    </Tabs>
  )
}
