import { useState } from "react";
import { useSelector } from "react-redux";
import Split from 'react-split-grid';
import { RootState } from "renderer/redux/store";
import NavBar from './navbar';
import LeftPane from "./left-pane";
import OpenedResources from "./opened-resources";
import { NewDimensionModal } from "./new-dimension-modal";
import { NewVariantModal } from "./new-variant-modal";
import { NewFolderModal } from "./new-folder-modal";
import { DeleteModal } from "./delete-modal";
import Footer from "./footer";
import { RenameModal } from "./rename-modal";
import TitleBar from "./title-bar";
import VarTooltip from "./var-tooltip";

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
  const [gridTemplateColumns, setGridTemplateColumns] = useState('300px 4px 1fr');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {(!WEB_BUILD) && <TitleBar/>}

      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          flex: '1 1 auto',
          overflow: 'hidden',
          minHeight: 0,
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
              <div style={{minWidth: 0}}>
                <OpenedResources/>
              </div>
            </div>
          )}
          gridTemplateColumns={gridTemplateColumns}
          onDrag={(d, t, s) => setGridTemplateColumns(s)}
        />

        <NewFolderModal/>
        <DeleteModal/>
        <NewDimensionModal/>
        <NewVariantModal/>
        <RenameModal/>
        <VarTooltip/>
      </div>

      {
        (Object.keys(project?.dimensions ?? {}).length > 0) && <Footer/>
      }
    </div>
  );
}
