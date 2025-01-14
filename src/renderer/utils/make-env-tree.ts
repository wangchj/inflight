import { TreeNodeData } from "@mantine/core";
import { Project } from "types/project";

/**
 * Makes the environment tree.
 *
 * @param project The project model object from which to make the tree.
 * @returns The tree nodes.
 */
export default function makeEnvTree(project: Project): TreeNodeData[] {
  if (!project || typeof project.envs !== 'object' || typeof project.envGroups !== 'object') {
    return [];
  }

  const rootId = project.envRoot;
  const root = project.envs[rootId];

  if (!root || !Array.isArray(root.envGroups)) {
    return [];
  }

  return root.envGroups
    .map(groupId => makeGroupNode(project, groupId, rootId))
    .filter(group => !!group);
}

/**
 * Makes an environment group node.
 *
 * @param project The project of the group.
 * @param groupId The id of the group.
 * @param parentId The parent id of the group
 * @returns The group node.
 */
function makeGroupNode(project: Project, groupId: string, parentId: string): TreeNodeData {
  const group = project.envGroups?.[groupId];

  if (!group) {
    return;
  }

  return {
    value: groupId,
    label: group.name,
    children: Array.isArray(group.envs) ? group.envs
      .map(envId => makeEnvNode(project, envId, groupId))
      .filter(env => !!env) : [],
    nodeProps: {
      type: 'envGroup',
      parentId,
    }
  }
}

/**
 * Makes an environment node.
 *
 * @param project The project of the environment.
 * @param groupId The id of the environment.
 * @param parentId The parent id of the environment
 * @returns The environment node.
 */
function makeEnvNode(project: Project, envId: string, parentId: string) : TreeNodeData {
  const env = project.envs[envId];

  if (!env) {
    return;
  }

  return {
    value: envId,
    label: env.name,
    children: Array.isArray(env.envGroups) ? env.envGroups
      .map(groupId => makeGroupNode(project, groupId, envId))
      .filter(group => !!group) : [],
    nodeProps: {
      type: 'env',
      parentId,
    }
  };
}
