# Web APIs Implementation Plan

## Dependencies

```toml
[dependencies]
bun-jsc = { path = "../bun-jsc" }
encoding_rs = "0.8"
url = "2.5"
bytes = "1.9"
```

## Architecture

```
bun-web/
├── src/
│   ├── lib.rs
│   ├── blob.rs
│   ├── file.rs
│   ├── form_data.rs
│   ├── streams/
│   │   ├── mod.rs
│   │   ├── readable.rs
│   │   ├── writable.rs
│   │   └── transform.rs
│   ├── encoding/
│   │   ├── mod.rs
│   │   ├── encoder.rs
│   │   └── decoder.rs
│   ├── url.rs
│   └── abort.rs
```

## Implementation Order

1. Blob/File (foundational)
2. URL/URLSearchParams
3. Text encoding
4. Streams
5. FormData
6. Other APIs
