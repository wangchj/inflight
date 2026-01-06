import { Box, Button, Stack, Table, TextInput, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState } from "renderer/redux/store";
import * as Env from "renderer/utils/env";
import { OpenedResource } from "types/opened-resource";

type VariantProps = {openedResource: OpenedResource};

export default function Variant({openedResource}: VariantProps) {
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const variant = project.variants?.[openedResource?.id];
  const dispatch = useDispatch();

  if (!variant) {
    return;
  }

  /**
   * Handles variable name change event.
   *
   * @param variantId The id of the variant that contains the variable.
   * @param index The index of the variable.
   * @param value The updated name.
   */
  function onVarNameChange(variantId: string, index: number, value: string) {
    const proj = JSON.parse(JSON.stringify(project));
    proj.variants[variantId].vars[index].name = value;
    Env.combine(proj, workspace.selectedVariants);
    dispatch(
      projectSlice.actions.updateVarName({
        id: openedResource.id,
        index,
        value
      })
    );
  }

  /**
   * Handles variable value change event.
   *
   * @param variantId The id of the variant that contains the variable.
   * @param index The index of the variable.
   * @param value The updated value.
   */
  function onVarValueChange(variantId: string, index: number, value: string) {
    const proj = JSON.parse(JSON.stringify(project));
    proj.variants[variantId].vars[index].value = value;
    Env.combine(proj, workspace.selectedVariants);
    dispatch(
      projectSlice.actions.updateVarValue({
        id: openedResource.id,
        index,
        value
      })
    );
  }

  /**
   * Handles variable delete event.
   *
   * @param variantId The id of the variant that contains the variable.
   * @param index The index of the variable.
   * @param value The updated value.
   */
  function onDeleteVar(variantId: string, index: number) {
    const proj = JSON.parse(JSON.stringify(project));
    proj.variants[variantId].vars.splice(index, 1);
    Env.combine(proj, workspace.selectedVariants);
    dispatch(projectSlice.actions.deleteVar({id: variantId, index}));
  }

  return (
    <Stack p="md">
      <Title order={4}>Variables</Title>

      {
        (variant.vars && variant.vars.length > 0) && (
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
                variant.vars.map((v, index) => (
                  <Table.Tr key={index}>

                    <Table.Td>
                      <TextInput
                        value={v.name}
                        onChange={
                          event => onVarNameChange(
                            openedResource.id, index, event.currentTarget.value
                          )
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        value={v.value}
                        onChange={
                          event => onVarValueChange(
                            openedResource.id, index, event.currentTarget.value
                          )
                        }
                      />
                    </Table.Td>

                    <Table.Td w={25} align="right">
                      <Button
                        color="dark"
                        variant="transparent"
                        p={0}
                        onClick={() => onDeleteVar(openedResource.id, index)}
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
