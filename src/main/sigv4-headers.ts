/**
 * Headers that should not be signed with sigv4. This is copied from
 * https://github.com/aws/aws-sdk-java-v2/blob/master/core/auth/src/main/java/software/amazon/awssdk/auth/signer/internal/AbstractAws4Signer.java#L72
 */
export const ignoredHeaders = new Set([
  'authorization',
  'connection',
  'x-amzn-trace-id',
  'user-agent',
  'expect',
  'presigned-expires',
  'range',
]);


/**
 * Makes the headers to be signed.
 *
 * @param headers User defined headers.
 * @param url The request URL object.
 * @return The headers to be signed.
 */
export function makeHeaders(headers: Record<string, string>, url: URL): Record<string, string> {
  return {
    ...filterHeaders(headers),
    'Host': url.hostname,
    // Date format: YYYYMMDD'T'HHMMSS'Z'
    'x-amz-date': new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
  };
}

/**
 * Filters out headers that should not be signed using `ignoredHeaders`.
 *
 * @param headers The headers to be filtered.
 * @return The filtered headers.
 */
export function filterHeaders(headers: Record<string, string>): Record<string, string> {
  if (!headers) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(headers).filter(e => !ignoredHeaders.has(e[0].toLocaleLowerCase()))
  );
}
