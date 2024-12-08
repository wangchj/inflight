import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import Editor from '@monaco-editor/react';

export default function RequestBody() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequests = workspace.openedRequests;
  const openedRequest = openedRequests[workspace.selectedRequestIndex];
  const request = openedRequest.request;

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
          defaultLanguage="json"
          value={request.body ?? ''}
          onChange={
            value => dispatch(workspaceSlice.actions.updateRequest({path: 'body', value}))
          }
          options={{
            minimap: {enabled: false},
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  )
}
