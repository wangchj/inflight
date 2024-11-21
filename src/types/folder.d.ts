import { Item } from 'types/item';

export interface Folder extends Item {
  items: Item[];
}
