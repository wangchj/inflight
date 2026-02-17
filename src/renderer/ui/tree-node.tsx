import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachInstruction,
  extractInstruction,
  Operation,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item';
import { DropIndicator as DropBox } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/border';
import { DropIndicator as DropLine } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import {
  Group,
  Menu,
  RenderTreeNodePayload,
  TreeNodeData
} from "@mantine/core";
import {
  IconChevronRight,
  IconCopy,
  IconCursorText,
  IconFolder,
  IconFolderOpen,
  IconFolderPlus,
  IconLayersSelected,
  IconStack2,
  IconTrash,
} from "@tabler/icons-react";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import MethodIcon from "./method-icon";
import validTreeMove from "renderer/utils/valid-tree-move";
import { projectSlice } from "renderer/redux/project-slice";
import { uiSlice } from "renderer/redux/ui-slice";
import { openInputModal } from "./input-modal";
import resourceName from "renderer/utils/resource-name";

/**
 * Project tree node component.
 */
export default function TreeNode({ payload }: { payload: RenderTreeNodePayload }) {
  /**
   * Determines if the context menu is open.
   */
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * The menu position.
   */
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  /**
   * Redux toolkit dispatch function.
   */
  const dispatch = useDispatch();

  /**
   * The project model object.
   */
  const project = useSelector((state: RootState) => state.project);

  /**
   * Node payload.
   */
  const { node, level, expanded, selected, hasChildren, elementProps } = payload;

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
   * Node ref. This is used for drag and drop purposes.
   */
  const outerRef = useRef(null);

  /**
   * Node label ref. This is used for drag and drop purposes.
   */
  const innerRef = useRef(null);

  /**
   * Drop target operation.
   */
  const [dropOp, setDropOp] = useState<Operation>(null);

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
            return { node };
          },
        }
      ),
      dropTargetForElements(
        {
          element: droppableElement,
          getData({ input, element }) {
            const data = { node };
            return attachInstruction(
              data,
              {
                input,
                element,
                operations: {
                  'reorder-before': 'available',
                  'reorder-after': 'available',
                  'combine': node.nodeProps.type === 'folder' ? 'available' : 'not-available',
                }
              }
            );
          },
          onDrag({ source, self }) {
            const sourceNode = source.data?.node as TreeNodeData;
            const selfNode = self.data?.node as TreeNodeData;

            if (!validTreeMove(project, sourceNode, selfNode)) {
              setDropOp(null);
              return;
            }

            setDropOp(extractInstruction(self.data).operation);
          },
          onDragLeave() {
            setDropOp(null);
          },
          onDrop({ source, self }) {
            setDropOp(null);

            const sourceNode = source.data?.node as TreeNodeData;
            const sourceType = sourceNode.nodeProps?.type;

            switch (sourceType) {
              case 'request':
              case 'folder':
                dispatch(projectSlice.actions.moveTreeNode({
                  drag: source.data.node as TreeNodeData,
                  drop: self.data.node as TreeNodeData,
                  op: dropOp
                }));
                break;

              case 'dimension':
                dispatch(projectSlice.actions.moveDimensionNode({
                  drag: source.data.node as TreeNodeData,
                  drop: self.data.node as TreeNodeData,
                  op: dropOp
                }));
                break;

              case 'variant':
                dispatch(projectSlice.actions.moveVariantNode({
                  drag: source.data.node as TreeNodeData,
                  drop: self.data.node as TreeNodeData,
                  op: dropOp
                }));
                break;
            }
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

      case 'variant':
        dispatch(workspaceSlice.actions.openVariant({
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
      <div style={{ display: 'flex', width: '2em', minWidth: '2em', justifyContent: 'flex-end' }}>
        <MethodIcon method={request?.method} />
      </div>
    )
  }

  /**
   * Handles onContextMenu event.
   *
   * @param event The event object.
   */
  function onContextMenu(event: MouseEvent) {
    setMenuPos({ x: event.clientX, y: event.clientY + 8 });
    setMenuOpen(true);
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles new folder menu item click event.
   *
   * @param node The node on which it's clicked.
   */
  function onNewFolderClick(node: TreeNodeData) {
    if (node.nodeProps.type === 'folder') {
      dispatch(uiSlice.actions.openNewFolderModal(node.value));
    }
  }

  /**
   * Handles duplicate menu item click event.
   *
   * @param node The node on which duplicate is clicked.
   */
  async function onDuplicateClick(node: TreeNodeData) {
    if (!node?.value || !node?.nodeProps?.type) {
      return;
    }

    const nodeType = node.nodeProps.type;

    const name = await openInputModal({
      title: `Duplicate ${resourceName(node)}`,
      value: `${node.label} copy`,
      confirmLabel: 'Duplicate'
    });

    if (!name) {
      return;
    }

    switch (nodeType) {
      case 'request':
        dispatch(projectSlice.actions.duplicateRequest({
          id: node.value,
          parentId: node.nodeProps.parentId,
          name,
        }));
        break;

      case 'variant':
        dispatch(projectSlice.actions.duplicateVariant({
          id: node.value,
          dimId: node.nodeProps.parentId,
          name,
        }));
        break;
    }
  }

  /**
   * Handles new variant menu item click event.
   *
   * @param node The dimension node on which it's clicked.
   */
  function onNewVariantClick(node: TreeNodeData) {
    dispatch(uiSlice.actions.openNewVariantModal(node.value));
  }

  /**
   * Handles rename menu item click event.
   *
   * @param node The node to rename.
   */
  function onRenameClick(node: TreeNodeData) {
    dispatch(uiSlice.actions.openRenameModal(node));
  }

  /**
   * Handles delete menu item click.
   *
   * @param node The node on which delete is clicked.
   */
  function onDeleteClick(node: TreeNodeData) {
    dispatch(uiSlice.actions.openDeleteModal(node));
  }

  return (
    <>
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
        onContextMenu={onContextMenu}
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
          {node.nodeProps.type === 'folder' && <FolderIcon size={folderWidth} opacity={0.8} />}
          {node.nodeProps.type === 'request' && getRequestIcon(node.value)}
          {node.nodeProps.type === 'dimension' && <IconStack2 size="1rem" opacity={0.8} />}
          {node.nodeProps.type === 'variant' && <IconLayersSelected size="1rem" opacity={0.8} />}

          <div style={{ textWrap: 'nowrap' }}>{node.label}</div>
        </div>

        {dropOp && (dropOp === 'combine' ?
          <DropBox /> :
          <DropLine
            edge={dropOp === 'reorder-before' ? 'top' : 'bottom'}
            indent={indent}
            type="terminal"
          />
        )}
      </Group>

      <Menu
        opened={menuOpen}
        onChange={open => !open && setMenuOpen(open)}
        shadow="sm"
        offset={4}
      >
        <Menu.Target>
          <div style={{
            position: 'fixed',
            left: menuPos.x,
            top: menuPos.y,
            width: 0,
            height: 0,
          }}/>
        </Menu.Target>
        <Menu.Dropdown>
          {node.nodeProps.type === 'folder' && (
            <Menu.Item
              leftSection={<IconFolderPlus size="1em" />}
              fz="xs"
              onClick={(e: any) => {
                e.stopPropagation();
                onNewFolderClick(node);
              }}
            >
              New Folder
            </Menu.Item>
          )}

          {(node.nodeProps.type === 'request' || node.nodeProps.type === 'variant') && (
            <Menu.Item
              leftSection={<IconCopy size="1em" />}
              fz="xs"
              onClick={(e: any) => {
                e.stopPropagation();
                onDuplicateClick(node);
              }}
            >
              Duplicate
            </Menu.Item>
          )}

          {node.nodeProps.type === 'dimension' && (
            <Menu.Item
              leftSection={<IconLayersSelected size="1em" />}
              fz="xs"
              onClick={(e: any) => {
                e.stopPropagation();
                onNewVariantClick(node);
              }}
            >
              New Variant
            </Menu.Item>
          )}

          <Menu.Item
            leftSection={<IconCursorText size="1em" />}
            fz="xs"
            onClick={(e: any) => {
              e.stopPropagation();
              onRenameClick(node);
            }}
          >
            Rename
          </Menu.Item>

          <Menu.Item
            color="red"
            leftSection={<IconTrash size="1em" />}
            fz="xs"
            onClick={(e: any) => {
              e.stopPropagation();
              onDeleteClick(node);
            }}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
