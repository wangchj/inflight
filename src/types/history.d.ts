import { Request } from './request'

/**
 * Request history, which consists of a list of entries.
 */
export interface History {
  /**
   * Schema version.
   */
  schemaVersion: '2.0';

  /**
   * The history entries. This maps the entry id to the entry.
   */
  entries: Record<string, HistoryEntry>;

  /**
   * The ordered list of entry ids.
   */
  ids: string[];
}

/**
 * A request history entry.
 */
export interface HistoryEntry {
  /**
   * The 13-digit milliseconds timestamp of when the request was made.
   */
  timestamp: number;

  /**
   * The request config.
   */
  request: Request;
}

/**
 * A group of history entries.
 */
export interface HistoryGroup {
  /**
   * The group label.
   */
  label: string;

  /**
   * An order list of history entry ids in this group.
   */
  ids: string[];
}
