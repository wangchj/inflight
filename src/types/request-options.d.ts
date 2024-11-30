export interface RequestOptions {
  method?: string;
  protocol?: string;
  hostname?: string;
  port?: string | number;
  path?: string;
  query?: object;
  fragment?: string;
  headers?: object;
  username?: string;
  password?: string;
  body?: string;
};
