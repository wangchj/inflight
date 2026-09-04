import * as Handlers from './bridge-handlers';

/**
 * Dispatches bridge invoke to a handler.
 *
 * @param message The bridge invoke message.
 * @returns The handler result.
 */
export function invoke(...message: any[]) {
  const [event, name] = message;
  const args = message.length > 2 ? message.slice(2) : [];
  const handlers = Handlers as Record<string, any>;
  if (typeof handlers[name] === 'function') {
    return handlers[name](...args);
  }
}
