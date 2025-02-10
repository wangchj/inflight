import { useState } from "react";
import { useSelector } from "react-redux";
import Split from 'react-split-grid';
import { RootState } from "renderer/redux/store";
import NavBar from './navbar';
import LeftPane from "./left-pane";
import OpenedResources from "./opened-resources";
import { NewFolderModal } from "./new-folder-modal";
import { DeleteModal } from "./delete-modal";
import Footer from "./footer";

/**
 * The project root component.
 */
export default function Project() {
  /**
   * The project model object.
   */
  const project = useSelector((state: RootState) => state.project);

  /**
   * Split pane widths.
   */
  const [gridTemplateColumns, setGridTemplateColumns] = useState('300px 1px 1fr');

  /**
   * Determines if the project has any selectable environments.
   */
  function hasSelectableEnvs() {
    const rootEnv = project?.envs?.[project?.envRoot];
    const rootGroups = rootEnv?.envGroups;
    return Array.isArray(rootGroups) && rootGroups.length > 0;
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
