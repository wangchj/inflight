# Inflight Directory-Based Project Format (IDP)

Version: 1.0
Date: August 19, 2026

## Introduction

Inflight is a REST API client designed to help developers and testers create, organize, replay, and share HTTP request configurations. A central feature of Inflight is the **Project**, which stores reusable requests and request dimensions (such as environments and variable sets).

The first version of Inflight stored an entire project as a single JSON document that mirrored the in-memory project model. While this approach was simple to implement, it had several limitations:

- **Memory inefficiency**: opening a project required loading all requests, dimensions, headers, authentication settings, and request bodies into memory at once. A project with a large number of requests or large request payloads could therefore have a large memory footprint.
- **Difficult source control**: developers may want to version-control projects using Git. Storing multiple request payloads inside a single JSON document makes diffs difficult to review. In particular, JSON request bodies become strings inside another JSON document, causing line breaks to be escaped.
- **Prone to project corruption**: saving a project required overwriting the entire project file. A failure during a save operation could therefore affect the entire project.
- **Limited extensibility**: adding new resource types or large resource properties required expanding a centralized document.

To address these limitations, Inflight introduces the **Inflight Directory-Based Project Format (IDP)**.

In IDP, a project consists of a root directory containing a collection of directories and files. Requests and dimensions are represented as independent resources on disk, while related configuration is grouped into the resource it belongs to. Large or independently editable content, such as request bodies and Markdown documentation, may be stored as separate files.

IDP is a persistence format and is intentionally distinct from the in-memory project model. The in-memory representation may use a different structure optimized for application performance.

## Design Principles

IDP is designed with the following principles:

- **Human-readable**: users should be able to browse a project using a normal file manager or text editor.
- **Git-friendly**: changes to one resource should affect only the files associated with that resource whenever practical.
- **Incrementally loadable**: implementations should be able to load resource metadata without loading the entire contents of a project into memory.
- **Self-describing**: the directory structure should make it possible to determine what each resource represents.
- **Extensible**: new resource types and resource properties should be addable without requiring a centralized project database.
- **Reasonable file granularity**: individual files should represent meaningful resources or independently editable content. Small properties of a resource should generally remain together rather than being split into separate files.

## Project Structure

An IDP project is a directory containing project metadata and resource directories.

For example:

```text
my-api/
├── project.json
├── requests/
│   ├── folder.json
│   ├── Users/
│   │   ├── folder.json
│   │   ├── Get User/
│   │   │   ├── request.json
│   │   │   ├── body
│   │   │   └── README.md
│   │   └── Create User/
│   │       ├── request.json
│   │       └── README.md
│   └── Orders/
│       ├── folder.json
│       └── List Orders/
│           ├── request.json
│           └── README.md
└── dimensions/
    ├── Environment/
    │   ├── variants/
    │   │   ├── Dev.json
    │   │   ├── Beta.json
    │   │   └── Prod.json
    │   ├── dimension.json
    │   └── README.md
    └── Region/
        ├── variants/
        │   ├── US.json
        │   └── EU.json
        ├── dimension.json
        └── README.md
```

The root directory name is user-defined and has no functional significance.

The project root must contain `project.json`.

The `requests` directory contains the request hierarchy. A directory containing `folder.json` represents a request folder. A directory containing `request.json` represents a request. If a directory contains neither `folder.json` nor `request.json`, it is considered a request folder.

The `dimensions` directory contains dimensions. Variants are stored in the `variants` sub-directory. Each variant is stored in a `.json` file, with the file name defined by the user. Each dimension folder optionally contains a `dimension.json` and `README.md`.

## `project.json`

Every project must contain a `project.json` file.

The file contains project-level metadata.

```typescript
interface ProjectFile {
  /**
   * The project storage format identifier.
   */
  spec: 'IDP-1.0';

  /**
   * Human-readable project name.
   */
  name: string;
}
```

Example:

```json
{
  "spec": "IDP-1.0",
  "name": "My API"
}
```

`project.json` should contain only project-level metadata. It should not contain indexes of requests, folders, or dimensions.

# Requests

The `requests` directory contains the requests in the project.

Requests may be organized into an arbitrary hierarchy of folders. The directory structure is reflected in the Inflight project tree.

For example:

```text
requests/
├── Users/
│   ├── Get User/
│   └── Create User/
└── Orders/
    └── List Orders/
```

A directory is considered a request if it contains `request.json`. A directory is considered a folder if it does not contain `request.json`. These 2 files are mutually exclusive.

## Folder

A folder may contain a `folder.json` file.

### `folder.json`

```typescript
/**
 * Currently this interface is unused and empty.
 */
interface FolderFile {
  /**
   * Contains the name of the items (sub-folders or request folders). This determines the display
   * order of the items.
   *
   * TODO: Need to determine if this should be broken into `folderChildren` and `requestChildren`.
   */
  children?: string[];
}
```

The root `requests` directory is also a request folder and may contain a `folder.json`.

# Request

A request is represented by a directory under the `requests` top-level folder. A request folder must contain a `request.json`.

Additional files may be present in the request directory. Payload files referenced by parts are not required to have a particular filename or location.

## `request.json`

`request.json` contains the request metadata and configuration.

The file intentionally contains both the request's basic metadata and its relatively small configuration properties, such as headers and authentication. These properties are kept together because they are all part of the request and are typically small.

```typescript
interface RequestFile {
  /**
   * HTTP request method, such as GET or POST.
   */
  method: string;

  /**
   * Request URL.
   */
  url: string;

  /**
   * HTTP request headers.
   */
  headers?: Header[];

  /**
   * Request authentication configuration.
   */
  auth?: Auth;

  /**
   * Request payload parts.
   *
   * Required when the request has a request body.
   * A request with a body always has at least one part.
   */
  parts?: Part[];
}
```

### Headers

```typescript
interface Header {
  key: string;
  value: string;
  enabled: boolean;
}
```

Example:

```json
{
  "method": "GET",
  "url": "{{baseUrl}}/users/{{userId}}",
  "headers": [
    {
      "key": "Accept",
      "value": "application/json",
      "enabled": true
    }
  ],
  "auth": {
    "type": "none"
  }
}
```

### Authentication

```typescript
interface Auth {
  type: 'none' | 'aws_sigv4';
}

/**
 * Base interface for AWS Signature V4 authentication.
 */
interface AwsSigv4Auth extends Auth {
  source: string;
  region?: string;
  service?: string;
}

/**
 * AWS Signature V4 authentication using an AWS CLI profile.
 */
interface AwsSigv4CliProfileAuth extends AwsSigv4Auth {
  source: 'aws_cli_profile';
  profile?: string;
}

/**
 * AWS Signature V4 authentication using inline credentials.
 */
interface AwsSigv4InlineAuth extends AwsSigv4Auth {
  source: 'inline';
  accessKey?: string;
  secretKey?: string;
  sessionToken?: string;
}
```

### Request Parts

A request payload is represented by one or more `Part` objects.

```typescript
interface Part {
  /**
   * Headers associated with this part.
   */
  headers?: Header[];

  /**
   * Path to the file containing the part payload.
   *
   * The path may be absolute or relative. A relative path is resolved relative to the request
   * directory.
   */
  path: string;
}
```

For a non-multipart request, `parts` contains exactly one entry.

For a multipart request, `parts` contains one entry for each multipart part.

This representation intentionally uses the same structure for both multipart and non-multipart requests.

For example, a simple JSON request may have:

```json
{
  "parts": [
    {
      "path": "payload.json"
    }
  ]
}
```

A multipart request may have:

```json
{
  "parts": [
    {
      "headers": [
        {
          "key": "Content-Disposition",
          "value": "form-data; name=\"description\"",
          "enabled": true
        }
      ],
      "path": "parts/description"
    },
    {
      "headers": [
        {
          "key": "Content-Disposition",
          "value": "form-data; name=\"file\"; filename=\"example.txt\"",
          "enabled": true
        }
      ],
      "path": "parts/file"
    }
  ]
}
```

The `parts` field is required when a request has a payload. Its absence means that the request has no request payload.

The format therefore does not infer the existence of a request body from the presence of files in the request directory.

## `README.md`

An optional `README.md` file contains Markdown documentation associated with the request.

The file is a plain Markdown document.

# Dimensions

The `dimensions` directory contains user-defined dimensions. A dimension is represented by a sub-directory under `dimensions` directory. The name of the dimension directory is user-defined. A dimension directory optionally contains a `dimension.json`. The dimension directory also contains the `variants` directory that contains the variants of the dimension. Each variants is a `.json` files with the name that is the same as display name of the variant, which is defined by the user.

## `dimension.json`

The following is the structure of `dimension.json` and variant file.

A variant is not treated as an independent resource. A variant exists only as part of its containing dimension.

```typescript
interface DimensionFile {
  /**
   * The name of the variants. This determines the display order of the variants.
   */
  children?: string[];
}
```

The following shows an example of `dimension.json`:


```json
{
  "children": [
    "Dev",
    "Beta",
    "Prod"
  ]
}
```

```typescript
interface VariantFile {
  /**
   * Variables provided by this variant.
   */
  vars?: Variable[];
}

interface Variable {
  name: string;
  value: string;
}
```

The order of the `variants` array determines the display order of variants in the UI.

## Dimension `README.md`

A dimension may optionally contain a `README.md` file containing documentation for the dimension.

# Unknown Files and Directories

Implementations should ignore files and directories that are not defined by this specification when they do not affect the interpretation of a known IDP resource.

This allows users and future versions of IDP to add additional files without necessarily making existing implementations unable to open the project.

In particular, hidden files used for caching or editor metadata must not affect the semantic contents of the project.

# Compatibility

A project conforming to IDP 1.0 must:

- contain a `project.json` file at its root;
- contain `spec: "IDP-1.0"` in `project.json`;
- represent requests using directories containing `request.json`;
- represent request folders using directories containing `folder.json`, or directories containing neither `folder.json` nor `request.json`;
- represent dimensions using directories containing `dimension.json`.

Implementations should reject projects whose `spec` value identifies an unsupported format version.

Future versions of IDP may introduce additional resource types, files, and properties while preserving compatibility with existing resources.
