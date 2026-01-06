import { Dimension } from './dimension';
import { Request } from 'types/request';
import { Folder } from 'types/folder';
import { Variant } from './variant';

export interface Project {
  schemaVersion: '2.0';
  name: string;
  folders?: Record<string, Folder>;
  requests?: Record<string, Request>;
  tree?: string;

  /**
   * Dimension records.
   */
  dimensions?: Record<string, Dimension>;

  /**
   * Variant records.
   */
  variants?: Record<string, Variant>;

  /**
   * Dimensions display order.
   */
  dimOrder?: string[];
}
