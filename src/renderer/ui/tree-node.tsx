import { Group, RenderTreeNodePayload, TreeNodeData } from "@mantine/core";
import { IconBraces, IconBrackets, IconChevronRight, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import MethodIcon from "./method-icon";
import NodeMenu from "./node-menu";

/**
 * Project tree node component.
 */
export default function TreeNode({payload}: {payload: RenderTreeNodePayload}) {
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) => state.project);
  const {node, level, expanded, selected, hasChildren, elementProps} = payload;

  const pl = `calc(var(--mantine-spacing-sm) + var(--level-offset) * ${level - 1})`;
  const FolderIcon = expanded ? IconFolderOpen : IconFolder;
  const hovered = elementProps['data-hovered'];

  /**
   * Handles tree node click/select event.
   *
   * @param node The node that's selected.
   */
  function onSelect(node: TreeNodeData) {
    if (node.nodeProps.type === 'request') {
      dispatch(workspaceSlice.actions.openRequest({
        id: node.value,
        folderId: node.value,
        request: project.requests[node.value]
      }));
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
      gap={8}
      wrap='nowrap'
      pos="relative"
      {...elementProps}
      onClick={event => {
        elementProps.onClick(event);
        onSelect(node);
      }}
      pl={pl}
      pr="sm"
      pt="0.2em"
      pb="0.2em"
      fz="sm"
    >

      <IconChevronRight
        size={16}
        style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        visibility={hasChildren ? 'visible' : 'hidden'}
      />

      {node.nodeProps.type === 'folder' && <FolderIcon size="1em" opacity={0.8}/>}
      {node.nodeProps.type === 'request' && getRequestIcon(node.value)}
      {node.nodeProps.type === 'envGroup' && <IconBrackets size="1em" opacity={0.8}/>}
      {node.nodeProps.type === 'env' && <IconBraces size="1em" opacity={0.8}/>}

      <div style={{textWrap: 'nowrap', overflow: 'hidden'}}>{node.label}</div>

      <NodeMenu
        node={node}
        deletable
        hovered={hovered}
        backgroundColor={selected ? 'var(--mantine-color-gray-1)' : 'white'}
      />
    </Group>
  )
}
