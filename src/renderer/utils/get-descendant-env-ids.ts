import { Environment } from "types/environment";
import { EnvironmentGroup } from "types/environment-group";
import { Project } from "types/project";

/**
 * Get all descendent env ids of a resource (env or env group), including the root itself.
 *
 * @param project The project object.
 * @param node The root node.
 * @returns A list of environment nodes under the specified node in the project.
 */
export default function getDescendantEnvIds(project: Project, id: string, type: string): string[] {
  const res = type === 'env' ? project?.envs?.[id] : project?.envGroups?.[id];

  if (!res) {
    return [];
  }

  switch (type) {
    case 'env':
      const env = res as Environment;
      return [
        id,
        ...Array.isArray(env.envGroups) ?
          env.envGroups.map(gid => getDescendantEnvIds(project, gid, 'envGroup')).flat() :
          []
      ];

    case 'envGroup':
      const group = res as EnvironmentGroup;
      return [
        id,
        ...Array.isArray(group.envs) ?
          group.envs.map(envId => getDescendantEnvIds(project, envId, 'env')).flat() :
          []
      ];

    default:
      return [];
  }
}
