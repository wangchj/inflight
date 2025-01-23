import { Box, Button, Divider, Tabs } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import RequestForm from './request-form';
import OpenedResourceTab from './opened-resource-tab';
import Environment from './environment';
import { OpenedResource } from 'types/opened-resource';

/**
 * Opened resource content component props.
 */
type OpenedResourceContentProps = {openedResource: OpenedResource};

/**
 * The opened resource content component.
 */
function OpenedResourceContent({openedResource}: OpenedResourceContentProps) {
  if (!openedResource) {
    return;
  }

  switch (openedResource.type) {
    case 'request':
      return openedResource.props.request && <RequestForm openedResource={openedResource}/>;

    case 'env':
      return <Environment openedResource={openedResource}/>;
  }
}

/**
 * The opened resources component.
 */
export default function OpenedResources() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedResources = workspace.openedResources;
  const selectedId = openedResources?.[workspace.selectedResourceIndex]?.id;

  return openedResources?.length ?
    (
      <Tabs
        value={selectedId}
        onChange={id => dispatch(workspaceSlice.actions.setSelectedTab(id))}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Tabs.List
          style={{flexGrow: 0, flexShrink: 1}}
        >
          {
            openedResources.map((openedResource, index) => (
              <OpenedResourceTab
                key={openedResource.id}
                index={index}
              />
            ))
          }

          <Divider orientation="vertical" ml="md" mt="sm" mb="sm"/>

          <div style={{display: 'flex', alignItems: 'center'}}>
            <Button
              variant="transparent"
              color="dark"
              onClick={() => dispatch(workspaceSlice.actions.newRequest())}
            >
              <IconPlus size="18"/>
            </Button>
          </div>

        </Tabs.List>

        {openedResources.map(openedResource => (
          <Tabs.Panel
            key={openedResource.id}
            value={openedResource.id}
            style={{
              flexGrow: 1,
            }}
          >
            <Box p="md" style={{height: '100%'}}>
              <OpenedResourceContent openedResource={openedResource}/>
            </Box>
          </Tabs.Panel>
        ))}
      </Tabs>
    ):
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }>
        <Button
          leftSection={<IconPlus/>}
          onClick={() => dispatch(workspaceSlice.actions.newRequest())}
        >
          New Request
        </Button>
      </div>
    )
}
