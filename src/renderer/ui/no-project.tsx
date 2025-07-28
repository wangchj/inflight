import { Button, Group, Stack, Title } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { IconFileSpark, IconFolderOpen, IconSend } from "@tabler/icons-react";
import { DragEvent } from "react";
import { useDispatch } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Persistence from "renderer/utils/persistence";

/**
 * The UI that's shown when no project is open.
 */
export default function NoProject() {
  const dispatch = useDispatch();

  /**
   * Handles New Project button click event.
   */
  async function newProject() {
    notifications.clean();

    try {
      const path = await window.showNewProjectDialog();
      const project = await Persistence.openProject(path);

      if (project) {
        dispatch(projectSlice.actions.setProject(project));
        dispatch(workspaceSlice.actions.openProject(path));
      }
    }
    catch (error) {
      notifications.show({
        id: 'newProject',
        color: 'red',
        title: 'Unable to create new project',
        message: (error instanceof Error ? error.message : String(error)),
        withBorder: true,
      });
    }
  }

  /**
   * Handles Open Project button click event.
   */
  async function openProject(path: string) {
    notifications.clean();

    try {
      const project = await Persistence.openProject(path);

      if (project) {
        dispatch(projectSlice.actions.setProject(project));
        dispatch(workspaceSlice.actions.openProject(path));
      }
    }
    catch (error) {
      notifications.show({
        id: 'openProject',
        color: 'red',
        title: 'Unable to open project',
        message: (error instanceof Error ? error.message : String(error)),
        withBorder: true,
      });
    }
  }

  /**
   * Handles the event when the open project button is clicked.
   */
  async function onOpenProjectButtonClick() {
    const path = await window.showOpenProjectDialog();
    openProject(path);
  }

  /**
   * Handles the event while a file is dragged over the UI from the OS.
   * @param event
   */
  function onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles the event when a file is dropped from the OS onto the UI.
   */
  function onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    try {
      const file = event.dataTransfer.files[0];
      const path = window.getFilePath(file);
      openProject(path);
    }
    catch (error) {
      notifications.show({
        id: 'openProject',
        color: 'red',
        title: 'Unable to open project',
        message: (error instanceof Error ? error.message : String(error)),
        withBorder: true,
      });
    }
  }

  return (
    <div
      className="app-drag"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Stack
        align="center"
        gap="xl"
      >
        <Title>
          <Group>
            <IconSend size="1em"/> Welcome to Inflight
          </Group>
        </Title>

        <Stack className="no-app-drag">
          <Button
            variant="transparent"
            justify="left"
            leftSection={<IconFileSpark/>}
            onClick={newProject}
          >
            New Project
          </Button>

          <Button
            variant="transparent"
            justify="left"
            leftSection={<IconFolderOpen/>}
            onClick={onOpenProjectButtonClick}
          >
            Open Project
          </Button>
        </Stack>
      </Stack>
    </div>
  )
}
