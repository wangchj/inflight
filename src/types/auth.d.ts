export interface Auth {
  type: 'none' | 'aws_sigv4';
}

export interface AwsSigv4Auth extends Auth {
  // Currently we only support aws_cli_profile source
  source: 'aws_cli_profile' | 'inline';
  profile?: string;
  region?: string;
  service?: string;
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}
