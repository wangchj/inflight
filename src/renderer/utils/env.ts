import { Project } from 'types/project';
import { Var } from 'types/var';

/**
 * The resolved environment map.
 */
let resolved: Record<string, string>;

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

/**
 * A string replacer function that replaces variable name with its value in the resolved
 * environment.
 *
 * @param match The matched variable expression.
 * @param name The variable name
 * @returns The replacement value.
 */
export function replacer(match: string, name: string) {
  const value = resolved?.[name];

  if (!value) {
    return match;
  }

  return value.replaceAll(/\{\{([^\}]+)\}\}/g, replacer);
}

/**
 * Replaces variables within an object with values from the resolved environment. This function
 * returns a new object and does not modify the object that's passed in.
 *
 * @param o The object to resolve.
 * @return The resolved object.
 */
export function resolve(o: any): any {
  if (!o) {
    return o;
  }

  switch (typeof o) {
    case 'object':
      if (Array.isArray(o)) {
        return o.map(i => resolve(i))
      }
      else {
        return Object.fromEntries(
          Object.entries(o).map(e => [e[0], resolve(e[1])])
        );
      }

    case 'string':
      return o.replaceAll(/\{\{([^\}]+)\}\}/g, replacer);

    default:
      return o;
  }
}
