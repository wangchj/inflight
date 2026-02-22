import { Stack, useComputedColorScheme } from '@mantine/core';
import { RequestResult } from "types/request-result";
import Monaco from "./monaco";
import { memo, useEffect, useRef, useState } from 'react';
import resultEditorPath from 'renderer/utils/result-editor-path';
import getEditorLanguage from 'renderer/utils/get-editor-language';

/**
 * ResultBody component props.
 */
interface ResultBodyProps {
  /**
   * The request id
   */
  id: string;

  /**
   * The request result object.
   */
  requestResult: RequestResult;

  /**
   * Determines if the response body should be display as prettified.
   */
  pretty: boolean;
}

/**
 * Debounce updateEditorContent() calls.
 */
let updateTimer: ReturnType<typeof setTimeout>;

/**
 * The result body UI component.
 */
function ResultBody({id, requestResult, pretty}: ResultBodyProps) {
  const colorScheme = useComputedColorScheme('dark');
  const editorRef = useRef(null);
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
        const action = editor.getAction('editor.action.formatDocument');
        if (action) {
          await action.run();
        }
        editor.updateOptions({readOnly: true});
      }
    }, 100)
  }

  /**
   * Updates the editor content when the pretty prop or response has changed.
   */
  useEffect(() => {
    updateEditorContent(pretty);
  }, [response, pretty]);

  if (!data) {
    return <div>The response does not contain data.</div>
  }

  return (
    <Stack style={{width: '100%', height: '100%'}}>
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
          theme={colorScheme === 'light' ? 'light' : 'vs-dark'}
        />
      </div>
    </Stack>
  )
}

export default memo(ResultBody);
