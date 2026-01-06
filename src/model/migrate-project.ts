import { Project } from "types/project";

/**
 * Migrates project model to the latest schema version.
 *
 * @param project The model to migrate.
 * @returns The migrate model.
 */
export function migrateProject(project: any): Project {
  if (!project) {
    return project;
  }

  if (!project.schemaVersion) {
    project.schemaVersion = '1.0';
  }

  switch (project.schemaVersion) {
    case '1.0':
      project = migrateV1ToV2(project);
  }

  return project;
}

/**
 * Migrates project model object from schema version 1.0 to 2.0.
 *
 * This function does not modify the model object that's passed in.
 *
 * @param project The project model object to migrate.
 * @return The migrated object model as a new object.
 */
export function migrateV1ToV2(project: any): any {
  if (!project) {
    return project;
  }

  const res = {...project};

  // Migrate `envs` to `variants`.
  if (typeof project.envs === 'object') {
    res.variants = Object.fromEntries(Object.entries(project.envs)
      .filter(([key, env]: [string, any]) => !!env.name)
      .map(([key, env]: [string, any]) => [
        key,
        {
          name: env.name,
          vars: env.vars,
        }
      ])
    );
  }

  // Migrate `envGroups` to `dimensions`.
  if (typeof project.envGroups === 'object') {
    res.dimensions = Object.fromEntries(Object.entries(project.envGroups)
      .filter(([key, envGroup]: [string, any]) => !!envGroup?.name)
      .map(([key, envGroup]: [string, any]) => [
        key,
        {
          name: envGroup.name,
          variants: envGroup.envs,
        }
      ])
    );
  }

  res.dimOrder = project.envs?.[project.envRoot]?.envGroups;

  delete res.envs;
  delete res.envGroups;
  delete res.envRoot;

  res.schemaVersion = '2.0';

  return res;
}
