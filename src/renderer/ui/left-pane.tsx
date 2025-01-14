import { Box, Stack } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import NodeMenu from './node-menu';
import EnvTree from './env-tree';
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

    case 'environments':
      return <EnvTree/>
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
    <Stack gap="xs">
      <div style={{
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
              value: project.tree,
              label: '',
              nodeProps: {type: 'folder'}
            } : null
          }
          deletable={false}
          hovered={true}
          backgroundColor='var(--mantine-color-gray-0)'
          top="0.6em"
        />
      </div>

      <Box mb="sm">
        {getTree(ui.selectedNavItem)}
      </Box>
    </Stack>
  )
}
