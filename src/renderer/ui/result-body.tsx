import { RequestResult } from "types/request-result";
import Editor from '@monaco-editor/react';

/**
 * Maps content-type to Monaco language.
 */
const languageMap = new Map([
  ['application/json', 'json']
]);

export default function ResultBody({requestResult}: {requestResult: RequestResult}) {
  const contentType = requestResult.response.headers?.['content-type'];
  const data = requestResult.response.data;

  if (!data) {
    return <div>The response does not contain data.</div>
  }

  return (
    <div
      style={{
        width: '100%',
        position: 'relative'
      }}
    >
      <div
        style={{
          position:'absolute',
          top:0,
          left:0,
          right: 0,
          bottom:0,
          overflow: 'hidden',
        }}
      >
        <Editor
          language={languageMap.get(contentType)}
          value={data}
          options={{
            readOnly: true,
            minimap: {enabled: false},
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
