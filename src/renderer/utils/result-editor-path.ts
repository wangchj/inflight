/**
 * Constructs result Monaco editor path from request id.
 *
 * @param requestId The request id.
 */
export default function resultEditorPath(requestId: string) {
  return `/results/${requestId}`;
}
