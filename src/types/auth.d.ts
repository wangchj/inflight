export interface Auth {
  type: 'none' | 'aws_sigv4';
}

/**
 * The base interface for AWS Signature V4 auth settings.
 */
export interface AwsSigv4Auth extends Auth {
  source: string;
  region?: string;
  service?: string;
}

/**
 * AWS Signature V4 authentication with AWS CLI profile as the credentials source.
 */
export interface AwsSigv4CliProfileAuth extends AwsSigv4Auth {
  source: 'aws_cli_profile';
  profile?: string
}

/**
 * AWS Signature V4 authentication with inline credentials.
 */
export interface AwsSigv4InlineAuth extends AwsSigv4Auth {
  source: 'inline';
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}
