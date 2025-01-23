import { Box, Button, Stack, Table, TextInput, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState } from "renderer/redux/store";
import { Environment } from "types/environment"
import { OpenedResource } from "types/opened-resource";

type EnvironmentProps = {openedResource: OpenedResource};

export default function Environment({openedResource}: EnvironmentProps) {
  const project = useSelector((state: RootState) => state.project);
  const env = project.envs?.[openedResource?.id];
  const dispatch = useDispatch();

  if (!env) {
    return;
  }

  return (
    <Stack>
      <Title order={4}>Environment Variables</Title>

      {
        (env.vars && env.vars.length > 0) && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {
                env.vars.map((v, index) => (
                  <Table.Tr key={index}>

                    <Table.Td>
                      <TextInput
                        value={v.name}
                        onChange={
                          event => dispatch(
                            projectSlice.actions.updateVarName({
                              id: openedResource.id,
                              index,
                              value: event.currentTarget.value
                            })
                          )
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        value={v.value}
                        onChange={
                          event => dispatch(
                            projectSlice.actions.updateVarValue({
                              id: openedResource.id,
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
                        onClick={() => dispatch(
                          projectSlice.actions.deleteVar({
                            id: openedResource.id,
                            index
                          })
                        )}
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
          onClick={() => dispatch(projectSlice.actions.addEmptyVar(openedResource.id))}
        >
          Add variable
        </Button>
      </Box>
    </Stack>
  )
}
