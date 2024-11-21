import { AppShell, Burger, Tree } from '@mantine/core';
import { useEffect, useState } from 'react';
import PageLoading from './layout/page-loading';
import { Project } from 'types/project';
import ProjectTree from './project-tree';
import { TreeNode } from 'types/tree-node';
import RequestForm from './request-form';
import { Request } from 'types/request';
import { useDispatch, useSelector } from 'react-redux';
import { setWorkspace } from 'renderer/redux/workspace-slice';
import { setProject } from 'renderer/redux/project-slice';
import { RootState } from 'renderer/redux/store';

/**
 * The app root component.
 */
export function App() {
  /**
   * Determines if loading project from disk is in progress.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Opened request node.
   */
  const [request, setRequest] = useState<Request>();

  /**
   * React Redux dispatch function.
   */
  const dispatch = useDispatch();

  /**
   * The workspace object.
   */
  const workspace = useSelector((state: RootState) => state.workspace);

  /**
   * Loads workspace from disk.
   */
  async function openWorkspace() {
    setLoading(true);

    try {
      const workspace = await window.openWorkspace();
      const project = await window.openProject(workspace?.projectRef.$ref);

      if (workspace) {
        dispatch(setWorkspace(workspace));
      }

      if (project) {
        dispatch(setProject(project));
      }
    }
    catch (error) {
      console.log(error);
    }

    setLoading(false);
  }

  /**
   * Inits the page.
   */
  useEffect(() => {
    openWorkspace();
  }, []);

  function onSelect(node: TreeNode) {
    setRequest(node.item as Request);

  }

  if (loading) {
    return <PageLoading/>
  }

  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',

      }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <ProjectTree/>
      </AppShell.Navbar>

      <AppShell.Main>
        {
          (workspace?.openedRequests && workspace.openedRequests.length > 0) ?
            <RequestForm request={workspace.openedRequests[0].request}/> :
            <div>No request selected</div>
        }
      </AppShell.Main>
    </AppShell>
  );
}
