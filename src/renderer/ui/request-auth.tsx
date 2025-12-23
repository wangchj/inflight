import { Select, Stack } from "@mantine/core";
import { useDispatch } from "react-redux";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { Auth, AwsSigv4Auth, AwsSigv4CliProfileAuth, AwsSigv4InlineAuth } from "types/auth";
import Input from "./input";

const authTypeOptions = [
  { value: 'none', label: 'None' },
  { value: 'aws_sigv4', label: 'AWS Signature Version 4' },
];

const credentialSourceOptions = [
  { value: 'aws_cli_profile', label: 'AWS CLI profile' },
  { value: 'inline', label: 'Inline' },
];

export default function RequestAuth({ auth }: { auth: Auth }) {
  const dispatch = useDispatch();

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
        auth?.type === 'aws_sigv4' && <AwsAuthSigv4Form auth={auth as AwsSigv4Auth} />
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
function AwsAuthSigv4Form({ auth }: { auth: AwsSigv4Auth }) {
  const dispatch = useDispatch();

  return (
    <Stack>
      <Select
        label="Credentials source"
        data={credentialSourceOptions}
        value={auth.source}
        onChange={
          value => value === null ? null : dispatch(
            workspaceSlice.actions.setAwsCredsSource(value)
          )
        }
      />

      {auth.source === 'aws_cli_profile' && (
        <Input
          label="Profile"
          descr="The AWS CLI profile. If not specified, the default profile is used."
          value={(auth as AwsSigv4CliProfileAuth).profile}
          onChange={
            value => dispatch(
              workspaceSlice.actions.updateRequest(
                { path: 'auth.profile', value }
              )
            )
          }
        />
      )}

      {auth.source === 'inline' && (
        <AwsAuthSigv4Inline auth={auth as AwsSigv4InlineAuth}/>
      )}

      <Input
        label="Region"
        value={auth.region}
        onChange={
          value => dispatch(
            workspaceSlice.actions.updateRequest(
              { path: 'auth.region', value }
            )
          )
        }
      />

      <Input
        label="Service name"
        value={auth.service || ''}
        onChange={
          value => dispatch(
            workspaceSlice.actions.updateRequest(
              { path: 'auth.service', value }
            )
          )
        }
      />
    </Stack>
  )
}

/**
 * The AWS Signature V4 inline auth form component.
 *
 * @param auth The auth settings model object.
 */
function AwsAuthSigv4Inline({auth}: {auth: AwsSigv4InlineAuth}) {
  const dispatch = useDispatch();

  return (
    <>
      <Input
          label="Access key"
          value={auth.accessKey ?? ''}
          onChange={
            value => dispatch(
              workspaceSlice.actions.updateRequest(
                { path: 'auth.accessKey', value }
              )
            )
          }
        />

        <Input
          label="Secret key"
          value={auth.secretKey ?? ''}
          onChange={
            value => dispatch(
              workspaceSlice.actions.updateRequest(
                { path: 'auth.secretKey', value }
              )
            )
          }
        />

        <Input
          label="Session token"
          value={auth.sessionToken ?? ''}
          onChange={
            value => dispatch(
              workspaceSlice.actions.updateRequest(
                { path: 'auth.sessionToken', value }
              )
            )
          }
        />
    </>
  )
}
