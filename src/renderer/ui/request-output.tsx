import './minor-tabs.css';
import {
  Box,
  Group,
  SegmentedControl,
  Tabs,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { Response } from "types/response";
import ResultHeaders from "./result-headers";
import ResultBody from "./result-body";
import ServerCertificate from "./server-certificate";

export default function RequestOutput() {
  const [selectedTab, setSelectedTab] = useState<string>('body');
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequest = workspace.openedResources[workspace.selectedResourceIndex];
  const result = useSelector((state: RootState) => state.results)[openedRequest.id];
  const [pretty, setPretty] = useState<boolean>(true);

  if (!result) {
    return
  }

  return (
    <Box
      pt="md"
      display="flex"
    >
      <Tabs
        variant='unstyled'
        classNames={{
          'list': 'minor-tabs-list',
          'tab': 'minor-tabs-tab'
        }}
        value={selectedTab}
        onChange={value => value === null ? null : setSelectedTab(value)}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          px="md"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
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

          <Group>
            <Text size="sm" py="0.4em">
              <Status response={result.response}/>
            </Text>

            {selectedTab === 'body' && (
              <SegmentedControl
                data={['Pretty', 'Raw']}
                value={pretty ? 'Pretty' : 'Raw'}
                onChange={value => setPretty(value === 'Pretty')}
                size='xs'
              />
            )}
          </Group>

        </Box>

        <Tabs.Panel
          key={`${openedRequest.id}_response_body`}
          value="body"
          style={{display: 'flex', flexGrow: 1, flexShrink: 1}}
        >
          <Box pt="md" style={{display: 'flex', flexGrow: 1, flexShrink: 1}}>
            <ResultBody id={openedRequest.id} requestResult={result} pretty={pretty}/>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel
          key={`${openedRequest.id}_result_headers`}
          value="headers"
          style={{flexGrow: 1}}
        >
          <Box pt="md" px="md">
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
              <Box pt="md" px="md">
                <ServerCertificate requestResult={result}/>
              </Box>
            </Tabs.Panel>
          )
        }
      </Tabs>
    </Box>
  )
}

/**
 * Component for color-coded response status.
 */
function Status({response}: {response: Response}) {
  const {statusCode, statusMessage} = response;

  let color = 'red';

  if (statusCode >= 100 && statusCode < 200) {
    color = 'blue';
  }
  if (statusCode >= 200 && statusCode < 300) {
    color = 'green';
  }
  if (statusCode >= 300 && statusCode < 400) {
    color = 'indigo';
  }
  if (statusCode >= 400 && statusCode < 500) {
    color='orange'
  }

  return (
    <span style={{color}}>{statusCode} {statusMessage}</span>
  )
}
