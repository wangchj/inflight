# Inflight Directory-Based Project (IDP) Format (Proposal A)

Version: 1.0
Date: July 15, 2026

## Introduction

This document describes Inflight Directory-Based Project (IDP) format, an Inflight Project organization scheme on disk. In IDP a project consists of a collection of directories and files. This format is an on-disk storage schema, which is distinct from how Inflight organize project model in memory.

Why do we have a separate project format for on-disk storage? The first version of Inflight did not have a separate storage format. The project file was just a JSON document that has the same structure as the in-memory project model. This approach actually made things very simple. When saving a project, all we really had to do was calling `JSON.stringify(project)` and passing in the in-memory project model. However, this format has the following limitations:

- No progressive loading: Since all the resources inside the project (requests, dimensions) is inside a single JSOn file, we couldn't just load one single resource. Once the project is open, everything is loaded into the memory. This is un-scalable for large projects that contains large number of requests (and long payloads).
- Hard to source control: Request payloads (body) had to be encoded into a JSON string to be in the JSON document. What this often means is that multiple lines in the request body are combined into a single line and line breaks are escaped as `\n`. This makes diffing between versions difficult.

With these motivations, the rest of this document describes the format.

## Format

An Inflight multi-file project consists of a collection of directories and files on disk and has the following structure:

```
my-api/
├── dimensions/
│   ├── my-dimension-1/
│   │   ├── _index.json
│   │   ├── README.md
│   │   ├── variant-1.json
│   │   └── variant-2.json
│   ├── my-dimension-2/
│   │   ├── _index.json
│   │   ├── README.md
│   │   ├── variant-1.json
│   │   └── variant-2.json
│   └── _index.json
├── requests/
│   ├── my-dir-1/
│   │   ├── my-request-1/
│   │   │   ├── _index.json
│   │   │   ├── auth.json
│   │   │   ├── body
│   │   │   ├── headers.json
│   │   │   └── README.md
│   │   ├── my-request-2/
│   │   │   ├── _index.json
│   │   │   ├── auth.json
│   │   │   ├── body
│   │   │   ├── headers.json
│   │   │   └── README.md
│   │   └── _index.json
│   ├── my-dir-2/
│   │   └── _index.json
│   └── _index.json
└── project.json
```

The following are the components:

- The root of the project is a directory (name `my-api` above). The name of the this directory is defined by the user and does not affect the functionality of the application.
- `project.json`: this file contains information about the project, such as the name of the project. This file is required for a project.
- `dimensions` directory: this directory contains user defined dimensions.
  - Each directory inside this directory is a dimension, which contain variants.
  - The name of a dimension file is defined by the user. The same name is showed in the app.
- `requests` directory: this directory contains requests defined by the user.
  - This directory contains arbitrary user defined number of directories (e.g., `my-dir-1`, and `my-dir-2`) and the directory structure can be arbitrarily deep. The same structure is showed as the project structure in the app.
- The request directory: each request is a directory. The name of the request directory is defined by the user and can be arbitrary. The request directory has the following:
  - `_index.json`: this file contains the metadata of a request, such as request method and URL. This file is required.
  - `README.md`: a markdown document describing the request.
  - `headers.json`: holds request headers.
  - `auth.json`: contains request authentication settings.
  - `body`: holds the content of the request body (payload).

## `project.json`

Every project has a `project.json`, which has the following format described in TypeScript definition:

```TypeScript
interface Project {
  /**
   * The project format. This should be 'IDP' followed by '-' and the spec version. Currently, the
   * only available version is 1.0.
   */
  spec: 'IDP-1.0';

  /**
   * The project name.
   */
  name: string;
}
```

## Request

This section describes how a request inside a project is organized. A request contains saved reusable request settings; so the user can easily replay the same or slight different requests in the future. In IDP, a request consists of a single directory and multiple file, each contains different settings of the request. In the previous Format section already lists the files within a request directory. This section specify the format of each file.

### `README.md`

The `README.md` is just a plain markdown file.

### `_index.json`

Each request has a `_index.json`. This file services are the root of the request and contains the metadata of the request. Note that we aim to keep this file small because the application needs to read this file for every request in the project to construct the request tree. Any additional files are referenced in this file, but currently, all files in the directory are implied and not specified in the file.

The following describe the format:

```TypeScript
interface RequestIndex {
  /**
   * A global unique string that identifies this resource.
   */
  id: string;

  /**
   * The request method, e.g., GET, POST.
   */
  method: string;

  /**
   * The request URL.
   */
  url: string;
}
```

### `auth.json`

The `auth.json` contains the authentications settings of the request. This has the same structure as the current project format:

```TypeScript
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
```

### `headers.json`

The `headers.json` contains a list of HTTP request header settings. Each header entry is defined as:

```TypeScript
interface Header {
  key: string;
  value: string;
  enabled: boolean;
}
```

An example of the `headers.json` file:

```json
[
  {
    "key": "Content-Type",
    "value": "application/json",
    "enabled": true
  },
  {
    "key": "User-Agent",
    "value": "Inflight",
    "enabled": true
  }
]
```

### `body`

The `body` file has no specific format. The content type is determined by the `Content-Type` header.

## Dimensions

The `dimensions` directory contains user defined dimensions in the project. A dimension contains a list of variants; each containing a list of key-value pairs. For example, the user can define an `Environment` dimension containing the variants `Beta`, `Gamma`, `Prod`. Then each of the variants holds the API URL for that environment. Environments shows as dropdown menu on the UI and each variant as an option. Variables in a request are replaced with the variables in selected variants.

### Dimension

A dimension is represented as a sub-directory of the `dimensions` directory. The name of the dimension directory is user defined. A dimension contains a `_index.json`, which has the following structure:

```TypeScript
{
  /**
   * The unique identifier of the dimension.
   */
  id: string;

  /**
   * Contains a list variant ids. Variants will be displayed in this order on the UI.
   */
  variants: string[];
}
```

### `README.md`

The `README.md` file is a plain markdown file.

### Variant

In addition to `_index.json` and `README.md`, the remaining `.json` files in a dimension directory are variant files e.g., `variant-1.json` in the example above; each is a variant defined by the user. A variant file has the following format:

```TypeScript
interface Variable {
  name: string;
  value: string;
}
```

```TypeScript
interface Variant {
  /**
   * The unique identifier of the variant.
   */
  id: string;

  /**
   * Contains a list variant ids. Variants will be displayed in this order on the UI.
   */
  vars: Variable[];
}
```

## Directory `_index.json`

Each subdirectory of `requests` directory contains `_index.json`. The purpose of this file is to hold the display order of subdirectories and requests. The following is the format:

```TypeScript
interface FolderIndex {
  /**
   * A globally unique identifier.
   */
  id: string;

  /**
   * Contains ids of sub-folders of this folder. The folders inside this folder are displayed in this order.
   */
  folders: string[];

  /**
   * Contains is of requests inside this folder. The requests are displayed in this order.
   */
  requests: string[];
}
```

One question remain. Since sub-directories and requests are represented as a directory. How do we distinguish between folder and request directories?
