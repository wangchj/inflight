import './split-layout.css';
import { useEffect, useState } from 'react';
import PageLoading from './layout/page-loading';
import { useDispatch, useSelector } from 'react-redux';
import Split from 'react-split-grid';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import { projectSlice } from 'renderer/redux/project-slice';
import { RootState, store } from 'renderer/redux/store';
import * as Env from "renderer/utils/env";
import * as Persistence from 'renderer/utils/persistence';
import { NewFolderModal } from './new-folder-modal';
import { DeleteModal } from './delete-modal';
import LeftPane from './left-pane';
import NavBar from './navbar';
import OpenedResources from './opened-resources';
import Footer from './footer';

window.printWorkspace = () => console.log(JSON.stringify(store.getState().workspace, null, 2));
window.printProject = () => console.log(JSON.stringify(store.getState().project, null, 2));
window.printResults = () => console.log(JSON.stringify(store.getState().results, null, 2));
window.printUi = () => console.log(JSON.stringify(store.getState().ui, null, 2));

/**
 * The app root component.
 */
export function App() {
  /**
   * Determines if loading project from disk is in progress.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Split pane widths.
   */
  const [gridTemplateColumns, setGridTemplateColumns] = useState('300px 1px 1fr');

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
      const project = await Persistence.openProject(workspace?.projectRef.$ref);

      Env.combine(project, workspace?.selectedEnvs ?? {});

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
   * Determines if the project has any selectable environments.
   */
  function hasSelectableEnvs() {
    const rootEnv = project?.envs?.[project?.envRoot];
    const rootGroups = rootEnv?.envGroups;
    return Array.isArray(rootGroups) && rootGroups.length > 0;
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <NavBar/>
        <Split
          cursor="ew-resize"
          // https://github.com/nathancahill/split/pull/728
          // @ts-ignore
          render={({getGridProps, getGutterProps}) => (
            <div className='main-split-grid' {...getGridProps()}>
              <LeftPane/>
              <div className="split-handle" {...getGutterProps('column', 1)}/>
              <OpenedResources/>
            </div>
          )}
          gridTemplateColumns={gridTemplateColumns}
          onDrag={(d, t, s) => setGridTemplateColumns(s)}
          onDragEnd={() => console.log('on drag end')}
        />

        <NewFolderModal/>
        <DeleteModal/>
      </div>

      {
        hasSelectableEnvs() && <Footer/>
      }
    </div>
  );
}
