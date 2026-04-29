import { TreeNodeData } from "@mantine/core";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { History, HistoryEntry, HistoryGroup } from "types/history";
import { maxEntries } from "renderer/redux/history-slice";

/**
 * Relative time format object.
 */
const rtf = new Intl.RelativeTimeFormat(undefined, {
  // localeMatcher: "best fit", // other values: "lookup"
  numeric: "auto", // other values: "auto"
  style: "long", // other values: "short" or "narrow"
});

/**
 * Date format object.
 */
const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric'
});

dayjs.extend(isToday);
dayjs.extend(isYesterday);

/**
 * Makes history tree data.
 *
 * @param history The history object.
 * @returns An array of TreeNodeData objects.
 */
export default function makeHistoryTree(history: History): TreeNodeData[] {
  return makeGroups(history)
    .map(group => makeGroupNode(history, group))
    .filter(group => !!group);
}

/**
 * Makes TreeNodeData from HistoryGroup object.
 *
 * @param history The history object.
 * @param entry The HistoryGroup object.
 * @returns The TreeNodeData object or undefined if group is invalid.
 */
function makeGroupNode(history: History, group: HistoryGroup): TreeNodeData | undefined {
  if (!group) {
    return;
  }

  const label = group.label;

  return {
    value: label,
    label: label,
    children: group.ids
      .map(id => makeEntryNode(history, id))
      .filter(e => !!e),
    nodeProps: {
      type: 'historyGroup'
    }
  };
}

/**
 * Makes history entry tree node.
 *
 * @param history History object.
 * @param id The history entry id.
 * @returns The TreeNodeData object or undefined if entry is invalid.
 */
function makeEntryNode(history: History, id: string): TreeNodeData | undefined {
  const entry = history?.entries?.[id];
  const request = entry?.request;

  if (!request?.url || !request?.method) {
    return;
  }

  return {
    value: id,
    label: request.url,
    nodeProps: {
      type: 'historyEntry',
      method: request.method,
    }
  };
}

/**
 * Converts a timestamp to label.
 *
 * @param timestamp The timestamp to convert.
 * @returns The label.
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);

  if (dayjs(timestamp).isToday()) {
    return capitalize(rtf.format(0, 'day'));
  }

  if (dayjs(timestamp).isYesterday()) {
    return capitalize(rtf.format(-1, 'day'));
  }

  return dateFormat.format(date);
}

/**
 * Capitalize the first letter.
 *
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
function capitalize(str: string): string {
  return `${str[0].toLocaleUpperCase()}${str.substring(1)}`;
}

/**
 * Make history entry groups.
 *
 * @param history The history object to group.
 * @returns The groups.
 */
function makeGroups(history: History): HistoryGroup[] {
  if (!Array.isArray(history.ids)) {
    return [];
  }

  const groups: HistoryGroup[] = [];
  const entries = history.entries;
  const ids = [...history.ids].reverse().slice(0, maxEntries);

  for (const id of ids) {
    const entry = entries[id];

    if (!entry || !entry.request) {
      continue;
    }

    const label = formatDate(entry.timestamp);
    const last = groups[groups.length - 1];
    const group = last?.label === label ? last : {label, ids: []};
    group.ids.push(id);

    if (group !== last) {
      groups.push(group);
    }
  }

  return groups;
}
