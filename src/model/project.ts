import { nanoid } from "@reduxjs/toolkit";
import { Folder } from "types/folder";
import { Project as IProject } from "types/project";

export default class Project implements IProject {
  readonly schemaVersion = '2.0';
  name: string;
  folders?: Record<string, Folder>;
  tree?: string;

  constructor(name: string) {
    this.name = name
    this.folders = {};

    const rootFolderId = nanoid();

    this.folders[rootFolderId] = {name: ''};
    this.tree = rootFolderId;
  }
}
