import { EnvironmentGroup } from "types/environment-group";

export interface Environment {
  name: string;
  vars?: Record<string, string>;
  envGroups?: string[];
}
