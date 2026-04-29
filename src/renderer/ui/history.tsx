import { getTreeExpandedState, Tree, useTree } from '@mantine/core';
import { useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import makeHistoryTree from 'renderer/utils/make-history-tree';
import TreeNode from './tree-node';

/**
 * The history tree component.
 */
export default function HistoryTree() {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.history);
  const data = useMemo(() => makeHistoryTree(history), [history]) ;
  const tree = useTree({
    initialExpandedState: getTreeExpandedState(data, '*'),
  });

  // console.log(getTreeExpandedState(data, '*'));

  return (
    <Tree
      data={data}
      tree={tree}
      selectOnClick
      renderNode={payload => <TreeNode payload={payload}/>}
    />
  )
}
