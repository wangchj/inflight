import {
  Card,
  Code,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { RequestResult } from "types/request-result";

/**
 * Transforms flat array raw headers to an array of entry pairs.
 *
 * @param rawHeaders The raw headers to transform.
 * @returns Entries.
 */
function rawHeadersToEntries(rawHeaders: string[]) {
  const res = [];
  for (let i = 0; i < rawHeaders.length; i = i + 2) {
    res.push([rawHeaders[i], rawHeaders[i + 1]]);
  }
  return res;
}

export default function ResultHeaders({requestResult}: {requestResult: RequestResult}) {
  const headers = requestResult.requestOptions.headers || {};
  const rawHeaders = requestResult.response.rawHeaders || [];

  return (
    <Stack gap="xl">
      <Card withBorder shadow="none" radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={500}>Request Headers</Text>
        </Card.Section>
        <Card.Section>
        <Table>
          <Table.Tbody>
            {
              (headers && Object.keys(headers).length > 0) ?
                Object.entries(headers).map(entry => (
                  <Table.Tr key={entry[0]}>
                    <Table.Td w="20%"><Code color="none">{entry[0]}</Code></Table.Td>
                    <Table.Td style={{lineBreak: 'anywhere'}}><Code color="none">{entry[1]}</Code></Table.Td>
                  </Table.Tr>
                )) :
              (
                <Table.Tr>
                  <Table.Td>No request headers.</Table.Td>
                </Table.Tr>
              )
            }
          </Table.Tbody>
        </Table>
        </Card.Section>
      </Card>

      <Card withBorder shadow="none" radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={500}>Response Headers</Text>
        </Card.Section>
        <Card.Section>
        <Table>
          <Table.Tbody>
            {
              (rawHeaders && rawHeaders.length > 0) ?
                rawHeadersToEntries(rawHeaders).map(entry => (
                  <Table.Tr key={entry[0]}>
                    <Table.Td w="20%"><Code color="none">{entry[0]}</Code></Table.Td>
                    <Table.Td style={{lineBreak: 'anywhere'}}><Code color="none">{entry[1]}</Code></Table.Td>
                  </Table.Tr>
                )) :
              (
                <Table.Tr>
                  <Table.Td>No response headers.</Table.Td>
                </Table.Tr>
              )
            }
          </Table.Tbody>
        </Table>
        </Card.Section>
      </Card>
    </Stack>
  )
}
