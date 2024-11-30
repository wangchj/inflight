import { Textarea } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";

export default function RequestBody() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequests = workspace.openedRequests;
  const openedRequest = openedRequests[workspace.selectedRequestIndex];
  const request = openedRequest.request;

  return (
    <Textarea
      classNames={{
        root: 'body-Textarea-root',
        wrapper: 'body-Textarea-wrapper',
        input: 'body-Textarea-input',
      }}
      value={request.body ?? ''}
      onChange={
        event => dispatch(workspaceSlice.actions.updateRequest({
          path: 'body',
          value: event.currentTarget.value
        }))
      }
    />
  )
}
