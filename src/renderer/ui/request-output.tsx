import {
  Box,
  Tabs,
} from "@mantine/core";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import ResultHeaders from "./result-headers";
import ResultBody from "./result-body";
import ServerCertificate from "./server-certificate";

export default function RequestOutput() {
  const [selectedTab, setSelectedTab] = useState<string>('body');
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequest = workspace.openedRequests[workspace.selectedRequestIndex];
  const result = useSelector((state: RootState) => state.results)[openedRequest.id];

  if (!result) {
    return <div>Click on send to initiate the request.</div>
  }

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
        <Tabs.Tab value="body">Body</Tabs.Tab>
        <Tabs.Tab value="headers">Headers</Tabs.Tab>
        <Tabs.Tab value="server_certificate">Server Certificate</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        key={`${openedRequest.id}_response_body`}
        value="body"
        style={{flexGrow: 1}}
      >
        <Box pt="md" h="100%">
          <ResultBody requestResult={result}/>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel
        key={`${openedRequest.id}_result_headers`}
        value="headers"
        style={{flexGrow: 1}}
      >
        <Box pt="md">
          <ResultHeaders requestResult={result}/>
        </Box>
      </Tabs.Panel>

      {
        result.response.peerCertificate && (
          <Tabs.Panel
            key={`${openedRequest.id}_server_certificate`}
            value="server_certificate"
            style={{flexGrow: 1}}
          >
            <Box pt="md">
              <ServerCertificate requestResult={result}/>
            </Box>
          </Tabs.Panel>
        )
      }
    </Tabs>
  )
}
