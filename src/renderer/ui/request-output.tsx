import './minor-tabs.css';
import {
  Box,
  Group,
  SegmentedControl,
  Stack,
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
import LocalInterface from './local-interface';
import RemoteInterface from './remote-interface';
import Connection from './connection';

export default function RequestOutput() {
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequest = (
    workspace &&
    workspace.openedResources &&
    workspace.selectedResourceIndex !== undefined
   ) ? workspace.openedResources[workspace.selectedResourceIndex] : undefined;
  const result = openedRequest?.id ?
    useSelector((state: RootState) => state.results)[openedRequest.id] : undefined;
  const [selectedTab, setSelectedTab] = useState<string>(
    openedRequest?.props?.request.method === 'HEAD' ? 'headers' : 'body'
  );
  const [pretty, setPretty] = useState<boolean>(true);

  if (!openedRequest || !result) {
    return
  }

  const socket = result?.response?.socket;

  return (
    <Box
      pt="md"
      display="flex"
      style={{
        flex: 1,
        height: '100%',
        minHeight: 0
      }}
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
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          px="md"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Tabs.List
            style={{
              flexGrow: 0,
            }}
          >

            <Tabs.Tab value="body">Body</Tabs.Tab>
            <Tabs.Tab value="headers">Headers</Tabs.Tab>
            {socket && (<Tabs.Tab value="network">Network</Tabs.Tab>)}
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
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            py="md"
            px="md"
            style={{
              flex: '1',
              minHeight: 0,
              overflowY: 'auto'
            }}
          >
            <ResultHeaders requestResult={result}/>
          </Box>
        </Tabs.Panel>

        {socket && (
          <Tabs.Panel
            key={`${openedRequest.id}_network`}
            value="network"
            style={{flexGrow: 1}}
          >
            <Box pt="md" px="md">
              <Stack>
                <LocalInterface socket={socket}/>
                <RemoteInterface socket={socket}/>
                <Connection socket={socket}/>
                <ServerCertificate requestResult={result}/>
              </Stack>
            </Box>
          </Tabs.Panel>
        )}
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
