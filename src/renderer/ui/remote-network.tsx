import {
  Card,
  Code,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { Socket } from "types/socket";

/**
 * The remote network info UI component.
 *
 * @param socket The request network socket.
 */
export default function RemoteNetwork({socket}: {socket: Socket}) {
  if (!socket) {
    return;
  }

  return (
    <Stack gap="xl">
      <Card withBorder shadow="none" radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={500}>Remote Network ({socket.remoteFamily})</Text>
        </Card.Section>
        <Card.Section>
        <Table>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td w="20%"><Code color="none">IP Address</Code></Table.Td>
              <Table.Td><Code color="none">{socket.remoteAddress}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Port</Code></Table.Td>
              <Table.Td><Code color="none">{socket.remotePort}</Code></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        </Card.Section>
      </Card>
    </Stack>
  )
}
