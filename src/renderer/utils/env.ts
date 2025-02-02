import { Project } from 'types/project';
import { Var } from 'types/var';

/**
 * The resolved environment map.
 */
let resolved;

/**
 * Converts an array of Var objects to an plain JavaScript object.
 *
 * @param vars The array of Var objects.
 * @returns An object.
 */
export function varsToObject(vars: Var[]) {
  if (!Array.isArray(vars)) {
    return {};
  }

  return vars.reduce((a, v) => {
    a[v.name] = v.value;
    return a;
  }, {} as Record<string, string>);
}

/**
 * Creates a flat map from all the selected environments.
 *
 * @param project The project model object.
 * @param selectMap An object that maps env group id to selected env id.
 */
export function combine(project: Project, selectMap: Record<string, string>) {
  resolved = {};

  const queue = [project.envRoot];

  while (queue.length > 0) {
    const envId = queue.shift();
    const env = project.envs?.[envId];

    if (!env) {
      continue;
    }

    resolved = {...resolved, ...varsToObject(env.vars)};

    if (Array.isArray(env.envGroups)) {
      for (const envGroupId of env.envGroups) {
        if (selectMap?.[envGroupId]) {
          queue.push(selectMap[envGroupId]);
        }
      }
    }
  }
}
