import { AppShell, Button } from '@mantine/core';
import { useEffect, useState } from 'react';
import PageLoading from './layout/page-loading';
import ProjectTree from './project-tree';
import { Request } from 'types/request';
import { useDispatch, useSelector } from 'react-redux';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import { projectSlice } from 'renderer/redux/project-slice';
import { RootState, store } from 'renderer/redux/store';
import OpenedRequests from './opened-requests';

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
        dispatch(workspaceSlice.actions.setWorkspace(workspace));
      }

      if (project) {
        dispatch(projectSlice.actions.setProject(project));
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

  if (loading) {
    return <PageLoading/>
  }

  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      footer={{
        height: 50,
      }}
      style={{height: '100%'}}
    >
      <AppShell.Navbar p="md">
        <ProjectTree/>
      </AppShell.Navbar>

      <AppShell.Main style={{
        // display:'flex',
        // flexDirection: 'column',
        height: '100%',
        // height: '100vh',
      }}>
        <OpenedRequests/>
      </AppShell.Main>

      <AppShell.Footer>
        <Button onClick={() => console.log(JSON.stringify(store.getState().workspace, null, 2))}>Print workspace</Button>
        <Button onClick={() => console.log(JSON.stringify(store.getState().project, null, 2))}>Print project</Button>
        <Button onClick={() => console.log(JSON.stringify(store.getState().results, null, 2))}>Print Results</Button>
      </AppShell.Footer>
    </AppShell>
  );
}
