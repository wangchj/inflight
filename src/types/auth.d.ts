export interface Auth {
  type: 'none' | 'aws_sigv4';
}

export interface AwsSigv4Auth extends Auth{
  source: 'aws_cli_profile' | 'inline';
  profile?: string;
  region?: string;
  service?: string;
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}
