# Web APIs Specification

## Overview

The Web APIs module provides standard Web Platform APIs including Fetch, Streams, Blob, File, FormData, URL, URLSearchParams, TextEncoder/TextDecoder, and more.

## Bun Reference

- Webcore: `bun-main/src/bun.js/webcore/`
- Streams: `bun-main/src/bun.js/webcore/streams.zig`
- Blob: `bun-main/src/bun.js/webcore/Blob.zig`
- Fetch: `bun-main/src/bun.js/webcore/fetch.zig`

## Public API

### Blob

```rust
pub struct Blob {
    data: Vec<u8>,
    type_: String,
}

impl Blob {
    pub fn new(parts: &[BlobPart], options: Option<BlobOptions>) -> Self;
    pub fn size(&self) -> usize;
    pub fn type_(&self) -> &str;
    pub async fn text(&self) -> String;
    pub async fn array_buffer(&self) -> ArrayBuffer;
    pub fn slice(&self, start: usize, end: usize, content_type: Option<&str>) -> Blob;
    pub fn stream(&self) -> ReadableStream;
}
```

### File

```rust
pub struct File {
    blob: Blob,
    name: String,
    last_modified: u64,
}

impl File {
    pub fn new(parts: &[BlobPart], name: &str, options: Option<FileOptions>) -> Self;
    pub fn name(&self) -> &str;
    pub fn last_modified(&self) -> u64;
}
```

### FormData

```rust
pub struct FormData {
    entries: Vec<(String, FormDataEntry)>,
}

impl FormData {
    pub fn new() -> Self;
    pub fn append(&mut self, name: &str, value: FormDataValue);
    pub fn delete(&mut self, name: &str);
    pub fn get(&self, name: &str) -> Option<&FormDataValue>;
    pub fn get_all(&self, name: &str) -> Vec<&FormDataValue>;
    pub fn has(&self, name: &str) -> bool;
    pub fn set(&mut self, name: &str, value: FormDataValue);
    pub fn entries(&self) -> impl Iterator<Item = (&str, &FormDataValue)>;
}
```

### Streams

```rust
pub struct ReadableStream {
    source: Box<dyn UnderlyingSource>,
}

impl ReadableStream {
    pub fn new(source: impl UnderlyingSource) -> Self;
    pub fn get_reader(&self) -> ReadableStreamReader;
    pub fn tee(&self) -> (ReadableStream, ReadableStream);
    pub fn pipe_to(&self, destination: WritableStream) -> Promise<()>;
    pub fn pipe_through<T: TransformStream>(&self, transform: T) -> ReadableStream;
}

pub struct WritableStream {
    sink: Box<dyn UnderlyingSink>,
}

impl WritableStream {
    pub fn new(sink: impl UnderlyingSink) -> Self;
    pub fn get_writer(&self) -> WritableStreamWriter;
    pub fn close(&self) -> Promise<()>;
}

pub struct TransformStream {
    readable: ReadableStream,
    writable: WritableStream,
}
```

### TextEncoder/TextDecoder

```rust
pub struct TextEncoder;
impl TextEncoder {
    pub fn encode(&self, input: &str) -> Uint8Array;
    pub fn encode_into(&self, input: &str, dest: &mut Uint8Array) -> EncodeResult;
}

pub struct TextDecoder {
    encoding: String,
    fatal: bool,
    ignore_bom: bool,
}
impl TextDecoder {
    pub fn new(label: Option<&str>, options: Option<TextDecoderOptions>) -> Result<Self>;
    pub fn decode(&self, input: Option<&[u8]>) -> Result<String>;
}
```

### URL / URLSearchParams

```rust
pub struct URL {
    href: String,
}

impl URL {
    pub fn new(url: &str, base: Option<&str>) -> Result<Self>;
    pub fn href(&self) -> &str;
    pub fn protocol(&self) -> &str;
    pub fn host(&self) -> &str;
    pub fn hostname(&self) -> &str;
    pub fn port(&self) -> &str;
    pub fn pathname(&self) -> &str;
    pub fn search(&self) -> &str;
    pub fn search_params(&self) -> URLSearchParams;
    pub fn hash(&self) -> &str;
    pub fn to_json(&self) -> String;
}

pub struct URLSearchParams {
    params: Vec<(String, String)>,
}

impl URLSearchParams {
    pub fn new(init: Option<URLSearchParamsInit>) -> Self;
    pub fn append(&mut self, name: &str, value: &str);
    pub fn delete(&mut self, name: &str);
    pub fn get(&self, name: &str) -> Option<&str>;
    pub fn get_all(&self, name: &str) -> Vec<&str>;
    pub fn has(&self, name: &str) -> bool;
    pub fn set(&mut self, name: &str, value: &str);
    pub fn sort(&mut self);
    pub fn to_string(&self) -> String;
}
```

## Features

- Full Web Streams API
- Blob and File API
- FormData with file support
- Text encoding/decoding (all encodings)
- URL parsing and manipulation
- AbortController/AbortSignal
- Performance API
- Crypto (Web Crypto API)

## Test Requirements

- [ ] Blob operations
- [ ] Stream pipelines
- [ ] FormData multipart
- [ ] Text encoding/decoding
- [ ] URL parsing edge cases
