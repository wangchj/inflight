import { Box, SegmentedControl, Stack } from '@mantine/core';
import { RequestResult } from "types/request-result";
import Monaco from "./monaco";
import { memo, useEffect, useRef, useState } from 'react';
import resultEditorPath from 'renderer/utils/result-editor-path';
import getEditorLanguage from 'renderer/utils/get-editor-language';

/**
 * Debounce updateEditorContent() calls.
 */
let updateTimer: ReturnType<typeof setTimeout>;

/**
 * The result body UI component.
 *
 * @param id The request id
 * @param requestResult The request result object.
 */
function ResultBody({id, requestResult}: {id: string, requestResult: RequestResult}) {
  const editorRef = useRef(null);
  const [pretty, setPretty] = useState<boolean>(true);
  const contentType = requestResult.response.headers?.['content-type'];
  const response = requestResult.response;
  const data = response.data;

  /**
   * Handles Monaco editor onMount event.
   *
   * @param editor The editor instance.
   */
  async function onEditorMount(editor: any, monaco: any) {
    editorRef.current = editor;

    if (data && data.length > 0 && !editor.getValue()) {
      updateEditorContent(pretty);
    }
  }

  /**
   * Update the Monaco editor content to be in sync with data.
   *
   * @param p Determine if content should be formatted.
   */
  function updateEditorContent(p: boolean) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (updateTimer) {
      clearTimeout(updateTimer);
    }

    updateTimer = setTimeout(async () => {
      editor.setValue(data);

      if (p && getEditorLanguage(contentType)) {
        editor.updateOptions({readOnly: false});
        await editor.getAction('editor.action.formatDocument').run();
        editor.updateOptions({readOnly: true});
      }
    }, 100)
  }

  /**
   * Handles pretty toggle event.
   */
  function onPrettyChange(value: string) {
    const p = value === 'Pretty';
    setPretty(p);
    updateEditorContent(p)
  }

  useEffect(() => {
    updateEditorContent(pretty);
  }, [response]);

  if (!data) {
    return <div>The response does not contain data.</div>
  }

  return (
    <Stack style={{width: '100%', height: '100%'}}>
      <Box>
        <SegmentedControl
          data={['Pretty', 'Raw']}
          value={pretty ? 'Pretty' : 'Raw'}
          onChange={onPrettyChange}
          size='xs'
        />
      </Box>

      <div style={{flexGrow: 1}}>
        <Monaco
          path={resultEditorPath(id)}
          keepCurrentModel
          onMount={onEditorMount}
          language={getEditorLanguage(contentType)}
          options={{
            readOnly: true,
            minimap: {enabled: false},
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </Stack>
  )
}

export default memo(ResultBody);
