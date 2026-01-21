# Node.js Compatibility Specification

## Overview

The Node.js compatibility module provides implementations of Node.js core modules, making Rust-Bun a drop-in replacement for Node.js. This includes fs, path, crypto, http, child_process, and many more.

## Bun Reference

- Node modules (JS): `bun-main/src/js/node/`
- Node modules (Zig): `bun-main/src/bun.js/node/`
- Node bindings (C++): `bun-main/src/bun.js/bindings/node/`

## Implemented Modules

### File System (node:fs)

```rust
// Sync variants
pub fn read_file_sync(path: &Path, options: Option<ReadOptions>) -> Result<Buffer>;
pub fn write_file_sync(path: &Path, data: &[u8], options: Option<WriteOptions>) -> Result<()>;
pub fn mkdir_sync(path: &Path, options: Option<MkdirOptions>) -> Result<()>;
pub fn rmdir_sync(path: &Path, options: Option<RmOptions>) -> Result<()>;
pub fn unlink_sync(path: &Path) -> Result<()>;
pub fn rename_sync(old: &Path, new: &Path) -> Result<()>;
pub fn stat_sync(path: &Path) -> Result<Stats>;
pub fn lstat_sync(path: &Path) -> Result<Stats>;
pub fn readdir_sync(path: &Path, options: Option<ReaddirOptions>) -> Result<Vec<DirEntry>>;
pub fn exists_sync(path: &Path) -> bool;
pub fn realpath_sync(path: &Path) -> Result<PathBuf>;
pub fn chmod_sync(path: &Path, mode: u32) -> Result<()>;
pub fn chown_sync(path: &Path, uid: u32, gid: u32) -> Result<()>;

// Async variants (all of the above)
pub async fn read_file(path: &Path, options: Option<ReadOptions>) -> Result<Buffer>;
// ...

// Streams
pub fn create_read_stream(path: &Path, options: Option<StreamOptions>) -> ReadStream;
pub fn create_write_stream(path: &Path, options: Option<StreamOptions>) -> WriteStream;

// Watchers
pub fn watch(path: &Path, options: Option<WatchOptions>) -> FSWatcher;
pub fn watch_file(path: &Path, options: Option<WatchFileOptions>) -> StatWatcher;

pub struct Stats {
    pub dev: u64,
    pub ino: u64,
    pub mode: u32,
    pub nlink: u64,
    pub uid: u32,
    pub gid: u32,
    pub rdev: u64,
    pub size: u64,
    pub blksize: u64,
    pub blocks: u64,
    pub atime_ms: f64,
    pub mtime_ms: f64,
    pub ctime_ms: f64,
    pub birthtime_ms: f64,
}

impl Stats {
    pub fn is_file(&self) -> bool;
    pub fn is_directory(&self) -> bool;
    pub fn is_symbolic_link(&self) -> bool;
    pub fn is_block_device(&self) -> bool;
    pub fn is_character_device(&self) -> bool;
    pub fn is_fifo(&self) -> bool;
    pub fn is_socket(&self) -> bool;
}
```

### Path (node:path)

```rust
pub mod path {
    pub fn basename(path: &str, ext: Option<&str>) -> String;
    pub fn dirname(path: &str) -> String;
    pub fn extname(path: &str) -> String;
    pub fn join(paths: &[&str]) -> String;
    pub fn resolve(paths: &[&str]) -> String;
    pub fn normalize(path: &str) -> String;
    pub fn relative(from: &str, to: &str) -> String;
    pub fn is_absolute(path: &str) -> bool;
    pub fn parse(path: &str) -> ParsedPath;
    pub fn format(parsed: &ParsedPath) -> String;
    pub fn sep() -> char;
    pub fn delimiter() -> char;
    
    pub mod posix { /* same functions with posix semantics */ }
    pub mod win32 { /* same functions with windows semantics */ }
}

pub struct ParsedPath {
    pub root: String,
    pub dir: String,
    pub base: String,
    pub ext: String,
    pub name: String,
}
```

### Crypto (node:crypto)

```rust
pub mod crypto {
    // Hashing
    pub fn create_hash(algorithm: &str) -> Hash;
    pub fn create_hmac(algorithm: &str, key: &[u8]) -> Hmac;
    
    // Ciphers
    pub fn create_cipher_iv(algorithm: &str, key: &[u8], iv: &[u8]) -> Cipher;
    pub fn create_decipher_iv(algorithm: &str, key: &[u8], iv: &[u8]) -> Decipher;
    
    // Random
    pub fn random_bytes(size: usize) -> Buffer;
    pub fn random_uuid() -> String;
    pub fn random_int(min: i64, max: i64) -> i64;
    
    // Key derivation
    pub fn pbkdf2(password: &[u8], salt: &[u8], iterations: u32, keylen: usize, digest: &str) -> Buffer;
    pub fn scrypt(password: &[u8], salt: &[u8], keylen: usize, options: ScryptOptions) -> Buffer;
    
    // Signing
    pub fn create_sign(algorithm: &str) -> Sign;
    pub fn create_verify(algorithm: &str) -> Verify;
    
    // Certificates
    pub struct X509Certificate { /* ... */ }
}

pub struct Hash {
    pub fn update(&mut self, data: &[u8]) -> &mut Self;
    pub fn digest(&self, encoding: Option<&str>) -> Buffer;
}
```

### Child Process (node:child_process)

```rust
pub mod child_process {
    pub fn spawn(command: &str, args: &[&str], options: Option<SpawnOptions>) -> ChildProcess;
    pub fn spawn_sync(command: &str, args: &[&str], options: Option<SpawnOptions>) -> SpawnSyncResult;
    pub fn exec(command: &str, options: Option<ExecOptions>) -> ChildProcess;
    pub fn exec_sync(command: &str, options: Option<ExecOptions>) -> Result<Buffer>;
    pub fn exec_file(file: &str, args: &[&str], options: Option<ExecOptions>) -> ChildProcess;
    pub fn fork(module: &str, args: &[&str], options: Option<ForkOptions>) -> ChildProcess;
}

pub struct ChildProcess {
    pub stdin: Option<Writable>,
    pub stdout: Option<Readable>,
    pub stderr: Option<Readable>,
    pub pid: u32,
    
    pub fn kill(&self, signal: Option<&str>) -> bool;
    pub fn on(&self, event: &str, callback: impl Fn());
}

pub struct SpawnOptions {
    pub cwd: Option<PathBuf>,
    pub env: Option<HashMap<String, String>>,
    pub stdio: StdioConfig,
    pub shell: Option<bool>,
    pub detached: bool,
}
```

### Buffer (node:buffer)

```rust
pub struct Buffer {
    inner: Vec<u8>,
}

impl Buffer {
    pub fn alloc(size: usize) -> Self;
    pub fn alloc_unsafe(size: usize) -> Self;
    pub fn from(data: impl Into<Vec<u8>>) -> Self;
    pub fn from_string(str: &str, encoding: Option<&str>) -> Self;
    pub fn concat(buffers: &[Buffer]) -> Self;
    pub fn compare(a: &Buffer, b: &Buffer) -> i32;
    
    pub fn length(&self) -> usize;
    pub fn to_string(&self, encoding: Option<&str>) -> String;
    pub fn write(&mut self, string: &str, offset: usize, encoding: Option<&str>) -> usize;
    pub fn copy(&self, target: &mut Buffer, target_start: usize) -> usize;
    pub fn slice(&self, start: usize, end: usize) -> Buffer;
    pub fn fill(&mut self, value: u8, start: usize, end: usize);
    
    // Reading
    pub fn read_uint8(&self, offset: usize) -> u8;
    pub fn read_uint16_be(&self, offset: usize) -> u16;
    pub fn read_uint16_le(&self, offset: usize) -> u16;
    pub fn read_uint32_be(&self, offset: usize) -> u32;
    pub fn read_uint32_le(&self, offset: usize) -> u32;
    pub fn read_float_be(&self, offset: usize) -> f32;
    pub fn read_float_le(&self, offset: usize) -> f32;
    pub fn read_double_be(&self, offset: usize) -> f64;
    pub fn read_double_le(&self, offset: usize) -> f64;
    
    // Writing (same pattern)
}
```

### Events (node:events)

```rust
pub struct EventEmitter {
    listeners: HashMap<String, Vec<Listener>>,
}

impl EventEmitter {
    pub fn new() -> Self;
    pub fn on(&mut self, event: &str, listener: impl Fn(&[JSValue]) + 'static);
    pub fn once(&mut self, event: &str, listener: impl Fn(&[JSValue]) + 'static);
    pub fn off(&mut self, event: &str, listener_id: ListenerId);
    pub fn emit(&self, event: &str, args: &[JSValue]) -> bool;
    pub fn remove_all_listeners(&mut self, event: Option<&str>);
    pub fn listener_count(&self, event: &str) -> usize;
    pub fn event_names(&self) -> Vec<String>;
}
```

### Streams (node:stream)

```rust
pub trait Readable {
    fn read(&mut self, size: Option<usize>) -> Option<Buffer>;
    fn on_data(&mut self, callback: impl Fn(Buffer));
    fn on_end(&mut self, callback: impl Fn());
    fn on_error(&mut self, callback: impl Fn(Error));
    fn pipe<W: Writable>(&mut self, destination: W) -> W;
    fn unpipe<W: Writable>(&mut self, destination: Option<W>);
}

pub trait Writable {
    fn write(&mut self, chunk: Buffer, callback: Option<impl Fn()>) -> bool;
    fn end(&mut self, chunk: Option<Buffer>);
    fn on_drain(&mut self, callback: impl Fn());
    fn on_finish(&mut self, callback: impl Fn());
}

pub trait Duplex: Readable + Writable {}
pub trait Transform: Duplex {
    fn transform(&mut self, chunk: Buffer, callback: impl Fn(Option<Error>, Option<Buffer>));
}
```

### Other Modules

- `node:os` - Operating system info
- `node:url` - URL parsing
- `node:querystring` - Query string parsing
- `node:net` - TCP networking
- `node:dns` - DNS resolution
- `node:http` - HTTP server/client
- `node:https` - HTTPS server/client
- `node:zlib` - Compression
- `node:util` - Utilities
- `node:assert` - Assertions
- `node:timers` - Timers
- `node:process` - Process info
- `node:vm` - VM
- `node:worker_threads` - Workers

## Test Requirements

### Unit Tests

- [ ] All fs operations
- [ ] Path manipulation
- [ ] Crypto algorithms
- [ ] Buffer operations
- [ ] Stream pipeline

### Compatibility Tests

- [ ] Run against Node.js test suite
- [ ] Test real-world npm packages
- [ ] Compare outputs with Node.js
