import { Workspace } from "types/workspace";

/**
 * Migrates workspace model to the latest schema version.
 *
 * @param workspace The model to migrate.
 * @returns The migrate model.
 */
export function migrateWorkspace(workspace: any): Workspace {
  if (!workspace) {
    return workspace;
  }

  if (!workspace.schemaVersion) {
    workspace.schemaVersion = '1.0';
  }

  switch (workspace.schemaVersion) {
    case '1.0':
      workspace = migrateV1ToV2(workspace);
  }

  return workspace;
}

/**
 * Migrates workspace model object from schema version 1.0 to 2.0.
 *
 * This function does not modify the model object that's passed in.
 *
 * @param workspace The workspace model object to migrate.
 * @return The migrated object model as a new object.
 */
export function migrateV1ToV2(workspace: any): any {
  if (!workspace) {
    return workspace;
  }

  const res = {...workspace};

  // Migrate `selectedEnvs` to `selectedVariants`.
  res.selectedVariants = workspace.selectedEnvs;
  delete workspace.selectedEnvs;

  res.schemaVersion = '2.0';

  return res;
}
