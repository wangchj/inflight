import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useState } from "react";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { CloseButton, Group, Tabs, Text } from "@mantine/core";
import { MouseEvent, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resultsSlice } from 'renderer/redux/results-slice';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import { OpenedResource } from "types/opened-resource";
import MethodIcon from "./method-icon";
import resultEditorPath from "renderer/utils/result-editor-path";
import { IconCircleFilled, IconLayersSelected } from "@tabler/icons-react";
import { RootState } from "renderer/redux/store";
import { Project } from "types/project";

type OpenedResourceTabProps = {
  index: number;
};

/**
 * The opened resource tab icon component.
 */
function TabIcon({openedResource}: {openedResource: OpenedResource}) {
  switch (openedResource.type) {
    case 'request':
      return <MethodIcon method={ openedResource?.props?.request.method}/>

    case 'variant':
      return <IconLayersSelected size="1em"/>
  }
}

/**
 * The opened resource tab label component.
 */
function TabLabel({project, openedResource}: {project: Project, openedResource: OpenedResource}) {
  let label;

  switch (openedResource.type) {
    case 'request':
      const request = openedResource.props.request;
      label = request.name || request.url || 'New Request';
      break;

    case 'variant':
      const variant = project.variants[openedResource.id];
      label = variant?.name || '';
      break;
  }

  return (
    <div style={{overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5em'}}>{label}</div>
  )
}

/**
 * Renders opened resource tab.
 */
export default function OpenedResourceTab({index} : OpenedResourceTabProps) {
  const project = useSelector((state: RootState) => state.project);
  const workspace = useSelector((state: RootState) => state.workspace);
  const dispatch = useDispatch();
  const openedResource = workspace.openedResources[index];
  const ref = useRef(null);
  const [dragEdge, setDragEdge] = useState(null);

  /**
   * Support tab drag and drop.
   *
   * https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/documentation/examples/list.tsx
   */
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    return combine(
      draggable({
        element,
        getInitialData() {
          return {index};
        },
        onDragStart({source}) {
          if (source?.data) {
            dispatch(workspaceSlice.actions.setSelectedTab(index))
          }
        },
      }),
      dropTargetForElements({
        element,
        getData({input, element}) {
          const data = {index};
          return attachClosestEdge(data, {input, element, allowedEdges: ['left', 'right']})
        },
        onDrag({source, self}) {
          if (source.data.index === undefined) {
              setDragEdge(null);
              return;
          }

          if (source.data.index === self.data.index) {
            setDragEdge(null);
            return;
          }

          const closestEdge = extractClosestEdge(self.data);

          if (closestEdge === 'left' && source.data.index as number + 1 === self.data.index) {
            setDragEdge(null);
            return;
          }

          if (closestEdge === 'right' && source.data.index as number - 1 === self.data.index) {
            setDragEdge(null);
            return;
          }

          setDragEdge(closestEdge);
        },
        onDragLeave() {
					setDragEdge(null);
				},
        onDrop({source, self}) {
          setDragEdge(null);

          if (!self.data || !source?.data) {
            return;
          }

          // Prevents a tree node to be dropped on a tab.
          if (source.data.index === undefined) {
            return;
          }

          if (self.data.index === source.data.index) {
            return;
          }

          const edge = extractClosestEdge(self.data);
          const fromIndex = source.data.index as number;
          const targetIndex = self.data.index as number;
          let toIndex: number;

          if (fromIndex < targetIndex) {
            switch (edge) {
              case 'left':
                toIndex = targetIndex - 1;
                break;
              case 'right':
                toIndex = targetIndex;
                break;
              default:
                toIndex = fromIndex;
            }
          }
          else {
            switch (edge) {
              case 'left':
                toIndex = targetIndex;
                break;
              case 'right':
                toIndex = targetIndex + 1;
                break;
              default:
                toIndex = fromIndex;
            }
          }

          if (fromIndex === toIndex) {
            return;
          }

          dispatch(workspaceSlice.actions.reorderResource({fromIndex, toIndex}));
        },
      })
    );
  }, [index]);

  return (
    <Tabs.Tab
      key={openedResource.id}
      value={openedResource.id}
      ref={ref}
      component="div"
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
          <TabLabel project={project} openedResource={openedResource}/>
        </Group>

        <Group gap="sm">
          {openedResource.dirty && <IconCircleFilled size="0.75em" color="gray" opacity={0.4}/>}

          <CloseButton
            size="sm"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();

              // Look for Monaco model
              const model = window.monaco?.editor?.getModels()?.find(
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
      {dragEdge && <DropIndicator edge={dragEdge} gap="1px" type="terminal-no-bleed"/>}
    </Tabs.Tab>
  )

}
