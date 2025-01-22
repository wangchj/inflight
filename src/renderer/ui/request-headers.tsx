import { Box, Button, Checkbox, Stack, Table, TextInput } from "@mantine/core";
import { IconTrash } from '@tabler/icons-react';
import { useDispatch } from "react-redux";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { Header } from "types/header";

export default function RequestHeaders({headers}: {headers: Header[]}) {
  const dispatch = useDispatch();

  return (
    <Stack>
      {
        (headers && headers.length > 0) && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th>Key</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {
                headers.map((header, index) => (
                  <Table.Tr key={index}>
                    <Table.Td w={22}>
                      <Checkbox
                        checked={header.enabled}
                        onChange={
                          () => dispatch(
                            workspaceSlice.actions.toggleHeader(index)
                          )
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        value={header.key}
                        onChange={
                          event => dispatch(
                            workspaceSlice.actions.updateHeaderKey({
                              index,
                              value: event.currentTarget.value
                            })
                          )
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        value={header.value}
                        onChange={
                          event => dispatch(
                            workspaceSlice.actions.updateHeaderValue({
                              index,
                              value: event.currentTarget.value
                            })
                          )
                        }
                      />
                    </Table.Td>

                    <Table.Td w={25} align="right">
                      <Button
                        color="dark"
                        variant="transparent"
                        p={0}
                        onClick={() => dispatch(workspaceSlice.actions.deleteHeader(index))}
                      >
                        <IconTrash/>
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))
              }
            </Table.Tbody>
          </Table>
        )
      }

      <Box>
        <Button
          onClick={() => dispatch(workspaceSlice.actions.addEmptyHeader())}
        >
          Add header
        </Button>
      </Box>
    </Stack>
  )
}
