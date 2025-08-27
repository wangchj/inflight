import { Button, Menu } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { Project } from "types/project";
import { Workspace } from "types/workspace";
import * as Env from "renderer/utils/env";

/**
 * Selectable environment menu component.
 *
 * @param groupId The env group id.
 * @returns The React UI element.
 */
function EnvMenu({groupId}: {groupId: string}) {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const group = project.envGroups?.[groupId];
  const selectedEnvId = workspace.selectedEnvs?.[groupId];
  const selectedEnv = project.envs?.[selectedEnvId];

  /**
   * Handles environment select event.
   *
   * @param groupId The id of the environment group on which the event occurred.
   * @param envId The id of the environment that's selected.
   */
  function onSelectEnv(groupId: string, envId?: string) {
    if (!groupId) {
      return;
    }

    const selectMap = {...workspace.selectedEnvs};
    envId ? selectMap[groupId] = envId : delete selectMap[groupId];
    Env.combine(project, selectMap);
    dispatch(workspaceSlice.actions.selectEnv({groupId, envId}));
  }

  return group && (
    <Menu
      withArrow
      offset={1}
    >
      <Menu.Target>
        <Button
          size="compact-xs"
          variant="subtle"
          color="dark"
          radius="lg"
        >
          {group.name}: {selectedEnv ? selectedEnv.name : 'None'}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          key=""
          leftSection={
            <IconCheck
              size="1em"
              style={{visibility: selectedEnvId ? 'hidden' : 'visible'}}
            />
          }
          onClick={() => onSelectEnv(groupId)}
        >
          None
        </Menu.Item>

        {group.envs?.map(envId => {
          const env = project.envs?.[envId];
          return env ? (
            <Menu.Item
              key={envId}
              leftSection={
                <IconCheck
                  size="1em"
                  style={{
                    visibility: selectedEnvId === envId ? 'visible' : 'hidden'
                  }}
                />
              }
              onClick={() => onSelectEnv(groupId, envId)}
            >
              {env.name}
            </Menu.Item>
          ) : null
        }).filter(item => !!item)}
      </Menu.Dropdown>
    </Menu>
  )
}

/**
 * The UI component that shows a list of selectable environments.
 */
function Envs() {
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const groupIds = getEnvGroupIds(workspace, project, project.envRoot);

  return (
    <>
      {groupIds
        .filter(groupId => !!project.envGroups?.[groupId])
        .map(groupId => <EnvMenu key={groupId} groupId={groupId}/>)
      }
    </>
  )
}

/**
 * Gets the list of ids of environment groups to show on the UI.
 *
 * @param workspace The workspace model object.
 * @param project The project model object.
 * @param envId The root environment id.
 * @returns The list of group ids.
 */
function getEnvGroupIds(workspace: Workspace, project: Project, envId: string): string[] {
  const env = project.envs?.[envId];

  if (!env) {
    return [];
  }

  const res = [];
  const groupIds = env.envGroups ?? [];

  for (const groupId of groupIds) {
    const group = project.envGroups?.[groupId];

    if (group?.envs?.length > 0) {
      res.push(groupId);
      res.push(getEnvGroupIds(workspace, project, group.envs.find(
        id => id === workspace.selectedEnvs?.[groupId]
      )));
    }
  }

  return res.flat();
}

/**
 * The footer UI component
 */
export default function Footer() {
  return (
    <div
      style={{
        flex: '0 0 auto',
        paddingInline: 'var(--mantine-spacing-md)',
        paddingBlock: 'var(--mantine-spacing-xs)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        backgroundColor: 'var(--mantine-color-gray-1)',
        gap: '1em',
      }}
    >
      <Envs/>
    </div>
  )
}
