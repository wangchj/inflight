import { EnvironmentGroup } from "types/environment-group";
import { Var } from "types/var";

export interface Environment {
  name: string;
  vars?: Var[];
  envGroups?: string[];
}
