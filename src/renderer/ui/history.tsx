import { getTreeExpandedState, Text, Tree, useTree } from '@mantine/core';
import { useMemo } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import makeHistoryTree from 'renderer/utils/make-history-tree';
import TreeNode from './tree-node';

/**
 * The history tree component.
 */
export default function HistoryTree() {
  const history = useSelector((state: RootState) => state.history);
  const data = useMemo(() => makeHistoryTree(history), [history]) ;
  const tree = useTree({
    initialExpandedState: getTreeExpandedState(data, '*'),
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
