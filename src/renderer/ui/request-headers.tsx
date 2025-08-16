import { Box, Button, Checkbox, Stack, Table, TextInput, Text } from "@mantine/core";
import { IconTrash } from '@tabler/icons-react';
import { useDispatch } from "react-redux";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { Header } from "types/header";
import Input from "./input";

export default function RequestHeaders({ headers }: { headers: Header[] }) {
  const dispatch = useDispatch();

  return (
    <Stack gap="lg">
      {
        (headers && headers.length > 0) && (
          <div
            className="grid-table"
            style={{
              display: 'grid',
              gridTemplateColumns: '22px 1fr 1fr 25px',
              gap: 'var(--mantine-spacing-sm)',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <div className="row header"
              style={{ display: 'contents' }}
            >
              <div className="cell fixed"></div>
              <div className="cell"><Text size="sm" fw={700}>Key</Text></div>
              <div className="cell"><Text size="sm" fw={700}>Value</Text></div>
              <div className="cell fixed"></div>
            </div>

            {
              headers.map((header, index) => (
                <div className="row" style={{ display: 'contents'}}>
                  <div className="cell fixed">
                    <Checkbox
                      checked={header.enabled}
                      onChange={
                        () => dispatch(
                          workspaceSlice.actions.toggleHeader(index)
                        )
                      }
                    />
                  </div>
                  <div className="cell" style={{ minWidth: '0px' }}>
                    <Input
                      value={header.key}
                      onChange={
                        value => dispatch(
                          workspaceSlice.actions.updateHeaderKey({
                            index,
                            value
                          })
                        )
                      }
                    />
                  </div>
                  <div className="cell" style={{ minWidth: '0px' }}>
                    <Input
                      value={header.value}
                      onChange={
                        value => dispatch(
                          workspaceSlice.actions.updateHeaderValue({
                            index,
                            value
                          })
                        )
                      }
                    />
                  </div>
                  <div className="cell fixed">
                    <Button
                      color="dark"
                      variant="transparent"
                      p={0}
                      onClick={() => dispatch(workspaceSlice.actions.deleteHeader(index))}
                    >
                      <IconTrash />
                    </Button>
                  </div>
                </div>
              ))
            }
          </div>
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
