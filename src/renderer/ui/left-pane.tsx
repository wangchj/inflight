import { Box } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import NodeMenu from './node-menu';
import DimensionTree from './dimension-tree';
import ProjectTree from './project-tree';
import { NavItem } from 'renderer/redux/ui-slice';

/**
 * Gets the tree element to render.
 *
 * @param selectedNavItem The selected nav item.
 * @returns The tree element.
 */
function getTree(selectedNavItem: NavItem) {
  switch (selectedNavItem) {
    case 'requests':
      return <ProjectTree/>

    case 'dimensions':
      return <DimensionTree/>
  }
}

/**
 * The project tree hierarchy component.
 *
 * @param project The project model object.
 */
export default function LeftPane() {
  const project = useSelector((state: RootState) => state.project);
  const ui = useSelector((state: RootState) => state.ui);

  return (
    <div
      style={{
        backgroundColor: 'var(--mantine-color-gray-0)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 'var(--mantine-spacing-xs)',
      }}
    >
      <div style={{
        flex: '0 0 auto',
        backgroundColor: 'var(--mantine-color-gray-0)',
        paddingInline: '1em',
        paddingBlock: '0.5em',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Box fz="sm">{project.name}</Box>
        <NodeMenu
          node={
            project.folders && project.tree ? {
              value: ui.selectedNavItem === 'requests' ? project.tree : '',
              label: '',
              nodeProps: {
                type: ui.selectedNavItem === 'requests' ? 'folder' : 'variant',
                root: true,
              }
            } : null
          }
          deletable={false}
          hovered={true}
          backgroundColor='var(--mantine-color-gray-0)'
          top="0.6em"
        />
      </div>

      <div
        style={{flex: 1, overflowX: 'hidden', overflowY: 'auto'}}
      >
        {getTree(ui.selectedNavItem)}
      </div>
    </div>
  )
}
