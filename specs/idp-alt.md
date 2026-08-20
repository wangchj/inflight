# Inflight Directory-Based Project Format (IDP) - Proposal B

Version: 1.0
Date: July 25, 2026

## Introduction

Inflight (https://inflight.dev) is a REST API client that is designed to reduce the efforts for API developers and testers to call a REST API. A central feature of the application is a Project, which allows users to save request configurations and request dimensions. The saved request configurations in the project can then be reused or shared.

The first version of Project persistence format is simply a JSON file that is the memory dump of the project model (the memory and on-disk model are the same). This format makes things very simple, because the application logic only needs to perform `JSON.stringify(project)` when saving the project. However, the single file format has various limitations:

- **Memory inefficiency**: when a project is opened, all settings of all requests and dimensions are loaded into the memory at once. A project with large number of settings or large request payloads would cause the application to have large memory footprint.
- **Difficult diffing**: developers may want to version control the project (e.g., with git). However, because all settings are stored in a single file, it's more difficult to see what's changed between versions. A diff would show the project is change, but not so obvious which part of the project (e.g., which request) has changed. In addition, many REST API use JSON as the payload format, which results in storing JSON documents inside a JSON document.
- **Prone to project corruption**: any save operation results in the entire project to be overwritten on disk. This cause the project to be more easily corrupted if there are bugs in the application.

To address these limitations, we introduce Inflight Directory-Based Project Format (IDP). In this format, a project consists of a root directory that consists of collection of sub-directory and files. IDP is a persistence format, which is likely to be different from the in-memory project model.

## Project Structure

The following is an example of the structure of a project on disk:

```
my-api/
├── dimensions/
│   ├── my-dimension-1.json
│   └── my-dimension-2.json
├── requests/
│   ├── my-dir-1/
│   │   ├── my-request-1/
│   │   │   ├── body
│   │   │   ├── request.json
│   │   │   └── README.md
│   │   └── my-request-2/
│   │       ├── body
│   │       ├── request.json
│   │       └── README.md
│   └── my-dir-2/
│       └── ...
└── project.json
```

Every project is contained inside a root directory. In the example, the project directory is named `my-api`. The name of the directory is specified by the user.

The root directory must contain the file `project.json`. This file contains project metadata and project index that signify what objects exist in the project (see Type Definitions section).

The `requests` directory contains the requests in the project. This directory can contain arbitrary number of sub-directories with arbitrary number of levels. A request is a directory that contains a `request.json`, which contains the headers and auth info. An optional `body` file in the directory contains the request payload. An optional `README.md` contains the request documentation.

The `dimensions` directory contains the dimensions in the project. Each `.json` file in this directory is a dimension that contains its variants. The name of dimension files (e.g., `my-dimension-1.json` and `my-dimension-2.json` in the example above) are specified by the user.

## Type Definitions

```typescript
/**
 * Folder index metadata.
 */
interface Folder {
  /**
   * The name of the folder specified by the user.
   */
  name: string;

  /**
   * Contains id of sub-folders in display order.
   */
  folders?: string[];

  /**
   * Contains id of requests in this folder in display order.
   */
  requests?: string[];
}

/**
 * A request index metadata.
 */
interface Request {
  /**
   * The name of the request.
   */
  name: string;

  /**
   * The request method, e.g., GET, POST.
   */
  method: string;

  /**
   * The URL of the request.
   */
  url: string;
}

interface Dimension {
  name: string;

  /**
   * Variant records in this dimension.
   */
  variants?: Record<string, Variant>;

  /**
   * A list of variant ids that signify the display order of variants.
   */
  variantOrder?: string[];
}

/**
 * A dimension variant.
 */
interface Variant {
  /**
   * The name of the variant.
   */
  name: string;

  /**
   * A list of variables in this variant.
   */
  vars?: Var[];
}

/**
 * A variable.
 */
interface Var {
  /**
   * The key of the variable.
   */
  name: string;

  /**
   * The value of the variable.
   */
  value: string;
}

/**
 * The structure of `project.json` file.
 */
interface ProjectFile {
  /**
   * The project format. This has the format {spec}-{version}. The only available value is
   * `IDP-1.0`.
   */
  spec: 'IDP-1.0';

  /**
   * The name of the project.
   */
  name: string;

  /**
   * A map that maps an unique folder id to the folder metadata. Each entry represents a folder
   * on-disk in the requests directory, including the root folder (the `requests` folder).
   */
  folders?: Record<string, Folder>;

  /**
   * A map that maps an unique request id to the request metadata. Each entry represents a request
   * in the project.
   */
  requests?: Record<string, Request>;

  /**
   * Dimension records.
   */
  dimensions?: Record<string, Dimension>;
}

/**
 * Request authentication configurations.
 */
interface Auth {
  type: 'none' | 'aws_sigv4';
}

/**
 * The base interface for AWS Signature V4 auth settings.
 */
interface AwsSigv4Auth extends Auth {
  source: string;
  region?: string;
  service?: string;
}

/**
 * AWS Signature V4 authentication with AWS CLI profile as the credentials source.
 */
interface AwsSigv4CliProfileAuth extends AwsSigv4Auth {
  source: 'aws_cli_profile';
  profile?: string
}

/**
 * AWS Signature V4 authentication with inline credentials.
 */
interface AwsSigv4InlineAuth extends AwsSigv4Auth {
  source: 'inline';
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}

/**
 * A request header.
 */
interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

/**
 * The structure of `request.json`.
 */
interface RequestFile extends Request {
  /**
   * Request auth configuration.
   */
  auth?: Auth;

  /**
   * Request headers.
   */
  headers?: Header[];
}
```
