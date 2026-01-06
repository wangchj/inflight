import { dispatch } from 'renderer/redux/store';
import { uiSlice } from 'renderer/redux/ui-slice';
import { Project } from 'types/project';
import { Var } from 'types/var';

/**
 * The resolved environment map.
 */
let resolved: Record<string, string> = {};

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
 * Creates a flat variable map from all selected variants.
 *
 * @param project The project model object.
 * @param selectMap An object that maps dimension id to selected variant id.
 */
export function combine(project: Project, selectMap: Record<string, string>) {
  resolved = {};

  if (!selectMap) {
    return;
  }

  for (let id of Object.values(selectMap)) {
    const v = project.variants?.[id];
    resolved = {...resolved, ...varsToObject(v?.vars)}
  }

  dispatch(uiSlice.actions.envCombined());
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
    throw new Error(
      `The variable '${name}' cannot be resolved. Make sure the correct variant is selected.`
    );
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

/**
 * Gets the value of a variable.
 *
 * @param name The variable name.
 * @return The value of the variable or undefined.
 */
export function get(name: string) {
  return resolved[name];
}
