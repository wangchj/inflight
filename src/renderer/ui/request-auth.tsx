import { Select, Stack, TextInput } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { AwsSigv4Auth } from "types/auth";

const authTypeOptions = [
  {value: 'none',      label: 'None'},
  {value: 'aws_sigv4', label: 'AWS Signature Version 4'},
];

const credentialSourceOptions = [
  {value: 'aws_cli_profile', label: 'AWS CLI profile'},
  {value: 'inline',          label: 'Inline'},
];

export default function RequestAuth() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequests = workspace.openedRequests;
  const openedRequest = openedRequests[workspace.selectedRequestIndex];
  const request = openedRequest.request;
  const auth = request.auth;

  return (
    <Stack>
      <Select
        label="Type"
        data={authTypeOptions}
        value={auth ? auth.type : 'none'}
        onChange={
          value => value === null ? null : dispatch(
            workspaceSlice.actions.setAuthType(value)
          )
        }
      />

      {
        auth?.type === 'aws_sigv4' && <AwsAuthSigv4Form auth={auth as AwsSigv4Auth}/>
      }
    </Stack>
  )
}

/**
 * AWS Signature V4 configurations.
 *
 * @param auth The auth object.
 * @return React elements.
 */
function AwsAuthSigv4Form({auth}: {auth: AwsSigv4Auth}) {
  const dispatch = useDispatch();

  return (
    <Stack>
      {/* <Select
        label="Credentials source"
        data={credentialSourceOptions}
        value={auth.source}
        onChange={
          value => value === null ? null : dispatch(
            workspaceSlice.actions.setAwsCredsSource(value)
          )
        }
      /> */}

      {auth.source === 'aws_cli_profile' && (
        <TextInput
          label="Profile"
          description="The AWS CLI profile. If not specified, the default profile is used."
          value={auth.profile}
          onChange={
            event => dispatch(
              workspaceSlice.actions.updateRequest(
                {path: 'auth.profile', value: event.currentTarget.value}
              )
            )
          }
        />
      )}

      {/* TODO: auth.source === 'inline' */}

      <TextInput
        label="Region"
        value={auth.region}
        onChange={
          event => dispatch(
            workspaceSlice.actions.updateRequest(
              {path: 'auth.region', value: event.currentTarget.value}
            )
          )
        }
      />

      <TextInput
        label="Service name"
        value={auth.service || ''}
        onChange={
          event => dispatch(
            workspaceSlice.actions.updateRequest(
              {path: 'auth.service', value: event.currentTarget.value}
            )
          )
        }
      />
    </Stack>
  )
}
