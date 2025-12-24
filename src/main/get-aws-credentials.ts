import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { AwsSigv4Auth, AwsSigv4CliProfileAuth, AwsSigv4InlineAuth } from "types/auth";

/**
 * Gets the sigv4 credentials provider object from request auth settings.
 *
 * @param auth The request auth settings object.
 * @returns The credentials provider object.
 */
export function getAwsCredentials(auth: AwsSigv4Auth): AwsCredentialIdentity | Provider<AwsCredentialIdentity> {
  switch (auth.source) {
    case 'inline':
      const inline = auth as AwsSigv4InlineAuth;
      return {
        accessKeyId: inline.accessKey,
        secretAccessKey: inline.secretKey,
        sessionToken: inline.sessionToken,
      };

    default:
      const cli = auth as AwsSigv4CliProfileAuth;
      return fromNodeProviderChain({profile: cli.profile, ignoreCache: true});
  }
}
