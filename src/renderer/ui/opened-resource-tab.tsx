import { CloseButton, Group, Tabs, Text } from "@mantine/core";
import { MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resultsSlice } from 'renderer/redux/results-slice';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import { RootState } from "renderer/redux/store";
import { OpenedResource } from "types/opened-resource";
import { Request } from "types/request";
import MethodIcon from "./method-icon";
import resultEditorPath from "renderer/utils/result-editor-path";
import { Environment } from "types/environment";
import { IconBraces } from "@tabler/icons-react";

type OpenedResourceTabProps = {
  index: number;
  openedResource: OpenedResource
};

/**
 * The opened resource tab icon component.
 */
function TabIcon({openedResource}: {openedResource: OpenedResource}) {
  switch (openedResource.type) {
    case 'request':
      const request = openedResource.model as Request;
      return <MethodIcon method={request.method}/>

    case 'env':
      const env = openedResource.model as Environment;
      return <IconBraces size="1em"/>
  }
}

/**
 * The opened resource tab label component.
 */
function TabLabel({openedResource}: {openedResource: OpenedResource}) {
  let label;

  switch (openedResource.type) {
    case 'request':
      const request = openedResource.model as Request;
      label = request.name || request.url || 'New Request';
      break;

    case 'env':
      const env = openedResource.model as Environment;
      label = env.name;
      break;
  }

  return <div style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{label}</div>
}

/**
 * Renders opened resource tab.
 */
export default function OpenedResourceTab({index, openedResource} : OpenedResourceTabProps) {
  if (!openedResource || index < 0) { // This should never happen
    return;
  }

  const dispatch = useDispatch();

  return (
    <Tabs.Tab
      key={openedResource.id}
      value={openedResource.id}
    >
      <Group gap="lg">

        <Group
          gap="xs"
          maw="20em"
          wrap="nowrap"
          style={{
            overflow: 'hidden'
          }}
        >
          <TabIcon openedResource={openedResource}/>
          <TabLabel openedResource={openedResource}/>
        </Group>

        <Group gap="sm">
          {openedResource.dirty && <Text c={'gray'} opacity={0.4} size='xs'>●</Text>}

          <CloseButton
            size="sm"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();

              // Look for Monaco model
              const model = window.monaco.editor.getModels()?.find(
                (m: any) => m._associatedResource.path === resultEditorPath(openedResource.id)
              );

              // Dispose Monaco model if exists.
              if (model) {
                model.dispose();
              }

              dispatch(resultsSlice.actions.deleteResult(openedResource.id));
              dispatch(workspaceSlice.actions.closeResource(index));
            }}
          />
        </Group>
      </Group>
    </Tabs.Tab>
  )

}
