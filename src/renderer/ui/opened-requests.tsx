import { CloseButton, Group, Tabs } from '@mantine/core';
import { MouseEvent } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';

export default function OpenedRequests() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequests = workspace.openedRequests;

  return Array.isArray(openedRequests) && openedRequests.length > 0 ?
    (
      <Tabs
        variant="outline"
        value={workspace.selectedRequest}
        onChange={id => dispatch(workspaceSlice.actions.setSelectedRequest(id))}
      >
        <Tabs.List>
          {
            openedRequests.map(request => (
              <Tabs.Tab value={request.path}>
                <Group gap="sm">
                  {request.request.name}
                  <CloseButton
                    size="sm"
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      dispatch(workspaceSlice.actions.closeRequest(request.path));
                    }}
                  />
                </Group>
              </Tabs.Tab>
            ))
          }
        </Tabs.List>

        <div>Request form</div>
      </Tabs>
    ):
    <div>No request selected</div>
}
