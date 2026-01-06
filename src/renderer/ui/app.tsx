import './app-drag.css';
import './split-layout.css';
import { useEffect, useState } from 'react';
import PageLoading from './layout/page-loading';
import { useDispatch, useSelector } from 'react-redux';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import { projectSlice } from 'renderer/redux/project-slice';
import { RootState, store } from 'renderer/redux/store';
import * as Env from "renderer/utils/env";
import * as Persistence from 'renderer/utils/persistence';
import Project from './project';
import NoProject from './no-project';

window.printWorkspace = () => console.log(JSON.stringify(store.getState().workspace, null, 2));
window.printProject = () => console.log(JSON.stringify(store.getState().project, null, 2));
window.printResults = () => console.log(JSON.stringify(store.getState().results, null, 2));
window.printUi = () => console.log(JSON.stringify(store.getState().ui, null, 2));
window.printPersistence = () => console.log(JSON.stringify(Persistence, null, 2));

/**
 * The app root component.
 */
export function App() {
  /**
   * Determines if loading project from disk is in progress.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * React Redux dispatch function.
   */
  const dispatch = useDispatch();

  /**
   * The project model object.
   */
  const project = useSelector((state: RootState) => state.project);

  /**
   * Loads workspace from disk.
   */
  async function openWorkspace() {
    setLoading(true);

    try {
      const workspace = await Persistence.openWorkspace();
      const project = await Persistence.openProject(workspace?.projectPath);

      if (project) {
        dispatch(workspaceSlice.actions.setWorkspace(workspace));
        dispatch(projectSlice.actions.setProject(project));
        Env.combine(project, workspace?.selectedVariants ?? {});
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

  return project ? <Project/> : <NoProject/>;
}
