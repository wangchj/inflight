import {
  Card,
  Code,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { Socket } from "types/socket";

/**
 * The local network info UI component.
 *
 * @param socket The request network socket.
 */
export default function Connection({socket}: {socket: Socket}) {
  if (!socket.cipher?.name) {
    return;
  }

  return (
    <Stack gap="xl">
      <Card withBorder shadow="none" radius="md">
        <Card.Section withBorder inheritPadding py="xs">
          <Text fw={500}>Connection</Text>
        </Card.Section>
        <Card.Section>
        <Table>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td w="20%"><Code color="none">Cipher</Code></Table.Td>
              <Table.Td><Code color="none">{socket.cipher.name}</Code></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        </Card.Section>
      </Card>
    </Stack>
  )
}
