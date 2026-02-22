import {
  Button,
  Loader,
  Select,
  Stack,
} from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { IconSend } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Split from 'react-split-grid';
import RequestConfig from "./request-config";
import RequestOutput from "./request-output";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { resultsSlice } from "renderer/redux/results-slice";
import * as Env from "renderer/utils/env";
import { SaveRequestModal } from "./save-request-modal";
import { OpenedResource } from "types/opened-resource";
import Input from "./input";

export default function RequestForm({openedResource} : {openedResource: OpenedResource}) {
  const [sending, setSending] = useState<boolean>(false);
  const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr');
  const dispatch = useDispatch();
  const request = openedResource.props.request;
  const result = useSelector((state: RootState) => state.results)[openedResource.id];

  // Adjust split layout based on the result.
  useEffect(() => {
    if (result) {
      if (gridTemplateColumns === '1fr') {
        setGridTemplateColumns('1fr 4px 2fr');
      }
    }
    else {
      if (gridTemplateColumns !== '1fr') {
        setGridTemplateColumns('1fr');
      }
    }
  }, [result]);

  /**
   * Handles Send button click event.
   */
  async function onSendClick() {
    notifications.clean();
    setSending(true);

    try {
      const resp = await window.sendRequest(Env.resolve(request));
      dispatch(resultsSlice.actions.setResult({id: openedResource.id, result: resp}));
    }
    catch (error) {
      dispatch(resultsSlice.actions.deleteResult(openedResource.id));
      notifications.show({
        id: 'sendRequest',
        color: 'orange',
        title: 'Unable to send request',
        message: (error instanceof Error ? error.message : String(error)),
        withBorder: true,
      });
    }

    setSending(false);
  }

  return (
    <Stack
      h="100%"
      gap={0}
      bg="var(--mantine-color-body)"
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          gap: 'var(--mantine-spacing-md)',
          padding: 'var(--mantine-spacing-md)',
          borderBottom: '1px solid var(--mantine-color-disabled)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
            width: '100%',
            alignItems: 'center',
            gap: 'var(--mantine-spacing-xs)',
          }}
        >
          <Select
            style={{flexGrow: 0, width: '120px'}}
            data={['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']}
            value={request.method}
            onChange={
              value => value === null ? null : dispatch(
                workspaceSlice.actions.updateRequest({path: 'method', value})
              )
            }
          />

          <Input
            value={request.url}
            onChange={value => dispatch(workspaceSlice.actions.updateRequest({path: 'url', value}))}
            placeholder="Request URL"
          />
        </div>

        <Button
          onClick={onSendClick}
          leftSection={sending ? <Loader size="xs" color="gray"/> : <IconSend size="1.4em"/>}
          style={{flexGrow: 0, flexShrink: 0}}
          disabled={sending}
        >
          Send
        </Button>

      </div>

      <Split
        cursor="ew-resize"
        // https://github.com/nathancahill/split/pull/728
        // @ts-ignore
        render={({getGridProps, getGutterProps}) => (
          <div className="request-split-grid" {...getGridProps()}>
            <RequestConfig request={request}/>
            {result && <div className="split-handle-request" {...getGutterProps('column', 1)}></div>}
            {result && <RequestOutput/>}
          </div>
        )}
        gridTemplateColumns={gridTemplateColumns}
        onDrag={(d, t, s) => setGridTemplateColumns(s)}
      />

      <SaveRequestModal/>
    </Stack>
  )
}
