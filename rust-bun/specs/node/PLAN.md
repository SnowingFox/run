# Node.js Compatibility Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
bun-jsc = { path = "../bun-jsc" }
tokio = { version = "1.43", features = ["full", "fs", "process", "net"] }
ring = "0.17"
sha2 = "0.10"
md-5 = "0.10"
hmac = "0.12"
aes = "0.8"
cbc = "0.1"
scrypt = "0.11"
pbkdf2 = "0.12"
flate2 = "1.0"
zstd = "0.13"
brotli = "7"
libc = "0.2"
nix = { version = "0.29", features = ["fs", "process", "signal"] }
```

### Internal Dependencies

- `bun-core`: Error types
- `bun-jsc`: JavaScript bindings

## Architecture

### Module Structure

```
bun-node/
├── src/
│   ├── lib.rs
│   ├── buffer.rs
│   ├── events.rs
│   ├── fs/
│   │   ├── mod.rs
│   │   ├── sync.rs
│   │   ├── async.rs
│   │   ├── promises.rs
│   │   ├── streams.rs
│   │   └── watcher.rs
│   ├── path/
│   │   ├── mod.rs
│   │   ├── posix.rs
│   │   └── win32.rs
│   ├── crypto/
│   │   ├── mod.rs
│   │   ├── hash.rs
│   │   ├── hmac.rs
│   │   ├── cipher.rs
│   │   ├── random.rs
│   │   └── sign.rs
│   ├── child_process/
│   │   ├── mod.rs
│   │   ├── spawn.rs
│   │   └── exec.rs
│   ├── stream/
│   │   ├── mod.rs
│   │   ├── readable.rs
│   │   ├── writable.rs
│   │   ├── duplex.rs
│   │   └── transform.rs
│   ├── net/
│   │   ├── mod.rs
│   │   ├── server.rs
│   │   └── socket.rs
│   ├── dns.rs
│   ├── http.rs
│   ├── https.rs
│   ├── os.rs
│   ├── url.rs
│   ├── querystring.rs
│   ├── zlib.rs
│   ├── util.rs
│   ├── assert.rs
│   ├── timers.rs
│   ├── vm.rs
│   └── worker_threads.rs
└── tests/
    ├── fs_tests.rs
    ├── crypto_tests.rs
    └── compat_tests.rs
```

### Key Design Decisions

#### 1. Unified Sync/Async

```rust
// Internal async implementation
async fn read_file_async(path: &Path, options: &ReadOptions) -> Result<Buffer> {
    let file = tokio::fs::File::open(path).await?;
    let mut contents = Vec::new();
    file.read_to_end(&mut contents).await?;
    Ok(Buffer::from(contents))
}

// Sync wrapper
pub fn read_file_sync(path: &Path, options: Option<ReadOptions>) -> Result<Buffer> {
    tokio::runtime::Handle::current().block_on(
        read_file_async(path, &options.unwrap_or_default())
    )
}

// Async export
pub async fn read_file(path: &Path, options: Option<ReadOptions>) -> Result<Buffer> {
    read_file_async(path, &options.unwrap_or_default()).await
}
```

#### 2. Buffer Implementation

```rust
pub struct Buffer {
    data: Vec<u8>,
}

impl Buffer {
    // Efficient from ArrayBuffer
    pub fn from_array_buffer(ab: &JSArrayBuffer) -> Self {
        Self { data: ab.as_slice().to_vec() }
    }
    
    // Zero-copy slice
    pub fn subarray(&self, start: usize, end: usize) -> BufferView {
        BufferView { buffer: self, start, end }
    }
}
```

#### 3. EventEmitter Pattern

```rust
pub struct EventEmitter {
    listeners: HashMap<String, Vec<Listener>>,
    max_listeners: usize,
}

struct Listener {
    id: ListenerId,
    callback: Box<dyn Fn(&[JSValue]) + Send + Sync>,
    once: bool,
}
```

## Implementation Order

### Month 1-2: Core

| Week | Tasks |
|------|-------|
| 1 | Buffer implementation |
| 2 | EventEmitter |
| 3-4 | fs sync operations |
| 5-6 | fs async, promises |
| 7-8 | fs streams, watchers |

### Month 3: Path & Crypto

| Week | Tasks |
|------|-------|
| 1 | path module |
| 2-3 | crypto hashing, random |
| 4 | crypto ciphers |

### Month 4: Process & Streams

| Week | Tasks |
|------|-------|
| 1-2 | child_process |
| 3-4 | streams |

### Month 5-6: Network & Others

| Week | Tasks |
|------|-------|
| 1-2 | net module |
| 3-4 | http/https |
| 5-6 | dns, os, util |
| 7-8 | Remaining modules |

## Risk Analysis

### High Risk

| Risk | Mitigation |
|------|------------|
| API compatibility | Test against Node.js test suite |
| Platform differences | Conditional compilation, CI |

### Medium Risk

| Risk | Mitigation |
|------|------------|
| Crypto correctness | Use well-tested crates |
| Stream semantics | Careful study of Node.js |

### Low Risk

| Risk | Mitigation |
|------|------------|
| Path operations | Well-defined behavior |
| fs operations | Standard OS calls |

## Performance Targets

- fs.readFile for 1MB: < 10ms
- path.join: < 1μs
- crypto.createHash: Match Node.js
- Buffer operations: Match V8 performance
