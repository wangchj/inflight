/**
 * Gets the Monaco editor language based on the content type.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
 *
 * @param contentType The content type
 * @return The language.
 */
export default function getEditorLanguage(contentType: string) {
  if (contentType.includes('application/json'))
    return 'json';
  if (contentType.includes('text/html'))
    return 'html';
}
