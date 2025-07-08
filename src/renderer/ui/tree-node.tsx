import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
// import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/list-item';
import { Group, RenderTreeNodePayload, TreeNodeData } from "@mantine/core";
import { IconBraces, IconBrackets, IconChevronRight, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import MethodIcon from "./method-icon";
import NodeMenu from "./node-menu";
import validTreeMove from "renderer/utils/valid-tree-move";
import { projectSlice } from "renderer/redux/project-slice";

/**
 * Project tree node component.
 */
export default function TreeNode({payload}: {payload: RenderTreeNodePayload}) {
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) => state.project);
  const {node, level, expanded, selected, hasChildren, elementProps} = payload;

  /**
   * Chevron icon width and height.
   */
  const chevronWidth = '1rem';

  /**
   * Folder icon width and height.
   */
  const folderWidth = '1rem';

  /**
   * Gap width.
   */
  const rowGap = '0.5rem';

  /**
   * Tree node left padding.
   */
  const pl = `calc(var(--mantine-spacing-sm) + var(--level-offset) * ${level - 1})`;

  /**
   * Drop indicator left indent.
   */
  const indent = `calc(var(--mantine-spacing-sm) + (${chevronWidth} + ${rowGap}) * ${level})`;

  /**
   * Folder icon (open or closed).
   */
  const FolderIcon = expanded ? IconFolderOpen : IconFolder;

  /**
   * Determines if current tree node is hovered.
   */
  const hovered = elementProps['data-hovered'];

  /**
   * Node ref. This is used for drag and drop purposes.
   */
  const outerRef = useRef(null);

  /**
   * Node label ref. This is used for drag and drop purposes.
   */
  const innerRef = useRef(null);

  /**
   * Drop target closest edge.
   */
  const [edge, setEdge] = useState(null);

  /**
   * Support node drag and drop.
   */
  useEffect(() => {
    const draggableElement = innerRef.current;
    const droppableElement = outerRef.current;

    if (!draggableElement || !droppableElement) {
      return;
    }

    return combine(
      draggable(
        {
          element: draggableElement,
          getInitialData() {
            return {node};
          },
        }
      ),
      dropTargetForElements(
        {
          element: droppableElement,
          getData({input, element}) {
            const data = {node};
            return attachClosestEdge(data, {input, element, allowedEdges: ['top', 'bottom']});
          },
          onDrag({source, self}) {
            const sourceNode = source.data?.node as TreeNodeData;
            const selfNode = self.data?.node as TreeNodeData;

            if (!validTreeMove(project, sourceNode, selfNode)) {
              setEdge(null);
              return;
            }

            setEdge(extractClosestEdge(self.data));
          },
          onDragLeave() {
            setEdge(null);
          },
          onDrop({source, self}) {
            setEdge(null);

            dispatch(projectSlice.actions.moveTreeNode({
              drag: source.data.node as TreeNodeData,
              drop: self.data.node as TreeNodeData,
              edge: extractClosestEdge(self.data)
            }));
          },
        }
      )
    );
  });

  /**
   * Handles tree node click/select event.
   *
   * @param node The node that's selected.
   */
  function onSelect(node: TreeNodeData) {
    switch (node.nodeProps.type) {
      case 'request':
        dispatch(workspaceSlice.actions.openRequest({
          id: node.value,
          folderId: node.nodeProps.parentId,
          request: project.requests?.[node.value]
        }));
        break;

      case 'env':
        dispatch(workspaceSlice.actions.openEnv({
          id: node.value
        }));
        break;
    }
  }

  /**
   * Makes request icon.
   *
   * @param requestId The request unique id.
   * @returns React element.
   */
  function getRequestIcon(requestId: string) {
    const request = project.requests[requestId];

    return (
      <div style={{display: 'flex', width: '2em', minWidth: '2em', justifyContent: 'flex-end'}}>
        <MethodIcon method={request?.method}/>
      </div>
    )
  }

  return (
    <Group
      ref={outerRef}
      gap={rowGap}
      wrap='nowrap'
      pos="relative"
      {...elementProps}
      onClick={event => {
        elementProps.onClick(event);
        onSelect(node);
      }}
      pl={pl}
      pr="sm"
      pt="0.2rem"
      pb="0.2rem"
      fz="sm"
      style={{
        alignItems: 'center',
      }}
    >
      <div
        style={{
          padding: 0,
          width: '1rem',
          height: '1rem',
          flex: '0 0'
        }}
      >
        <IconChevronRight
          size={chevronWidth}
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          visibility={hasChildren ? 'visible' : 'hidden'}
        />
      </div>

      <div
        ref={innerRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: '0.5em',
        }}
      >
        {node.nodeProps.type === 'folder' && <FolderIcon size={folderWidth} opacity={0.8}/>}
        {node.nodeProps.type === 'request' && getRequestIcon(node.value)}
        {node.nodeProps.type === 'envGroup' && <IconBrackets size="1rem" opacity={0.8}/>}
        {node.nodeProps.type === 'env' && <IconBraces size="1rem" opacity={0.8}/>}

        <div style={{textWrap: 'nowrap', overflow: 'hidden'}}>{node.label}</div>
      </div>

      <NodeMenu
        node={node}
        deletable
        hovered={hovered}
        backgroundColor={selected ? 'var(--mantine-color-gray-1)' : 'white'}
      />

      {edge && <DropIndicator edge={edge} indent={indent} type="terminal"/>}
    </Group>
  )
}
