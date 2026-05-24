import { Text, Tree, TreeNodeData, useTree } from '@mantine/core';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { uiSlice } from 'renderer/redux/ui-slice';
import makeHistoryTree from 'renderer/utils/make-history-tree';
import TreeNode from './tree-node';

/**
 * Makes an object that is the expanded states of the tree nodes, denoted by nodeData.
 *
 * @param nodeData The tree nodes
 * @param foldedNodes The set of folded history groups from the ui-slice.
 */
function makeNodeExpandedState(nodeData: TreeNodeData[], foldedNodes: string[]) {
  return Array.isArray(nodeData) ? nodeData.reduce((acc: Record<string, boolean>, node) => {
    const {value, nodeProps} = node;
    if (nodeProps.type === 'historyGroup' && (!foldedNodes || !foldedNodes.includes(value))) {
      acc[value] = true;
    }

    return acc
  }, {}) : {};
}

/**
 * The history tree component.
 */
export default function HistoryTree() {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.history);
  const ui = useSelector((state: RootState) => state.ui);
  const data = useMemo(() => makeHistoryTree(history), [history]) ;
  const initialExpandedState = useMemo(
    () => makeNodeExpandedState(data, ui.historyFoldedGroups),
    [data, ui.historyFoldedGroups]
  );
  const tree = useTree({
    initialExpandedState,
    onNodeExpand: value => dispatch(uiSlice.actions.expandHistoryGroup(value)),
    onNodeCollapse: value => dispatch(uiSlice.actions.foldHistoryGroup(value)),
  });

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Text fz="sm" c="dimmed" ta="center" mt="1rem">History is empty</Text>
    )
  }

  return (
    <Tree
      data={data}
      tree={tree}
      selectOnClick
      renderNode={payload => <TreeNode payload={payload}/>}
    />
  )
}
