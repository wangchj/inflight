import './split-layout.css';
import { useEffect, useState } from 'react';
import PageLoading from './layout/page-loading';
import ProjectTree from './project-tree';
import { useDispatch, useSelector } from 'react-redux';
import Split from 'react-split-grid';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import { projectSlice } from 'renderer/redux/project-slice';
import { RootState } from 'renderer/redux/store';
import OpenedRequests from './opened-requests';
import { NewFolderModal } from './new-folder-modal';

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
    <>
      <Split
        cursor="ew-resize"
        // https://github.com/nathancahill/split/pull/728
        // @ts-ignore
        render={({getGridProps, getGutterProps}) => (
          <div className='main-split-grid' {...getGridProps()}>
            <ProjectTree/>
            <div className="split-handle" {...getGutterProps('column', 1)}/>
            <OpenedRequests/>
          </div>
        )}
        gridTemplateColumns={gridTemplateColumns}
        onDrag={(d, t, s) => setGridTemplateColumns(s)}
        onDragEnd={() => console.log('on drag end')}
      />

      <NewFolderModal/>
    </>
  );
}
