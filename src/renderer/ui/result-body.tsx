import { Box, SegmentedControl, Stack } from '@mantine/core';
import { RequestResult } from "types/request-result";
import Monaco from "./monaco";
import { memo, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resultsSlice } from "renderer/redux/results-slice";
import resultEditorPath from 'renderer/utils/result-editor-path';

/**
 * Maps content-type to Monaco language.
 */
const languageMap = new Map([
  ['application/json', 'json']
]);

function ResultBody({id, requestResult}: {id: string, requestResult: RequestResult}) {
  const dispatch = useDispatch();
  const monacoRef = useRef(null);
  const [editor, setEditor] = useState<any>();
  const [pretty, setPretty] = useState<boolean>(true);
  const contentType = requestResult.response.headers?.['content-type'];
  const data = requestResult.response.data;

  /**
   * Handles Monaco editor onMount event.
   *
   * @param _editor The editor instance.
   */
  async function onEditorMount(_editor: any, monaco: any) {
    setEditor(_editor);
    monacoRef.current = monaco;
  }

  /**
   * Tells Monaco Editor to format the current editor content.
   */
  async function prettify() {
    if (editor && data && languageMap.get(contentType) && !requestResult.prettied) {
      editor.updateOptions({readOnly: false});
      await editor.getAction('editor.action.formatDocument').run();
      editor.updateOptions({readOnly: true});
      dispatch(resultsSlice.actions.setResult({id, result: {...requestResult, prettied: true}}));
    }
  }

  /**
   * Handles pretty toggle event.
   */
  function onPrettyChange(value: string) {
    if (value === 'Pretty') {
      prettify();
    }
    else {
      if (editor) {
        editor.updateOptions({readOnly: false});
        editor.setValue(data);
        editor.updateOptions({readOnly: true});
        dispatch(resultsSlice.actions.setResult({id, result: {...requestResult, prettied: false}}));
      }
    }

    setPretty(value === 'Pretty');
  }

  /**
   * Handles editor mount event.
   */
  useEffect(() => {
    if (pretty) {
      prettify();
    }
  }, [editor]);

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
          language={languageMap.get(contentType)}
          defaultValue={data}
          options={{
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
