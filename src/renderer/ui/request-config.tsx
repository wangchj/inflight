import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  TextInput,
  Title
} from "@mantine/core";
import { useState } from "react";
import { Request } from "types/request"
import RequestAuth from "./request-auth";

interface RequestConfigProps {
  request: Request;
}
export default function RequestConfig({request}: RequestConfigProps) {
  const [selectedTab, setSelectedTab] = useState<string>('auth');

  return (
    <Tabs
      value={selectedTab}
      onChange={value => value === null ? null : setSelectedTab(value)}
    >
      <Tabs.List>
        <Tabs.Tab value="auth">Auth</Tabs.Tab>
        <Tabs.Tab value="headers">Headers</Tabs.Tab>
        <Tabs.Tab value="body">Body</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        key={`${request.name}_auth`}
        value="auth"
      >
        <Box pt="md" style={{maxWidth: '500px'}}>
          <RequestAuth/>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel
        key={`${request.name}_headers`}
        value="headers"
      >
        <Box pt="md">
          Headers panel
        </Box>
      </Tabs.Panel>

      <Tabs.Panel
        key={`${request.name}_body`}
        value="body"
      >
        <Box pt="md">
          Body panel
        </Box>
      </Tabs.Panel>
    </Tabs>
  )
}
