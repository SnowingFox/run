# Node.js Compatibility Tasks

## Prerequisites

- `bun-core` (error types)
- `bun-jsc` (JavaScript bindings)

## Implementation Tasks

### Phase 1: Core Utilities

- [ ] **TASK-NODE-001**: Create crate structure
- [ ] **TASK-NODE-002**: Implement Buffer type
- [ ] **TASK-NODE-003**: Implement EventEmitter
- [ ] **TASK-NODE-004**: Error types (NodeError)
- [ ] **TASK-NODE-005**: process global object

### Phase 2: File System (fs)

- [ ] **TASK-NODE-006**: Basic sync operations (readFile, writeFile)
- [ ] **TASK-NODE-007**: Directory operations (mkdir, rmdir, readdir)
- [ ] **TASK-NODE-008**: File stats (stat, lstat)
- [ ] **TASK-NODE-009**: File permissions (chmod, chown)
- [ ] **TASK-NODE-010**: Symlinks (symlink, readlink)
- [ ] **TASK-NODE-011**: Async variants
- [ ] **TASK-NODE-012**: fs/promises module
- [ ] **TASK-NODE-013**: ReadStream, WriteStream
- [ ] **TASK-NODE-014**: FSWatcher, watch
- [ ] **TASK-NODE-015**: copyFile, cp (recursive)

### Phase 3: Path

- [ ] **TASK-NODE-016**: basename, dirname, extname
- [ ] **TASK-NODE-017**: join, resolve
- [ ] **TASK-NODE-018**: normalize, relative
- [ ] **TASK-NODE-019**: parse, format
- [ ] **TASK-NODE-020**: posix/win32 variants

### Phase 4: Crypto

- [ ] **TASK-NODE-021**: Hash algorithms (md5, sha1, sha256, etc.)
- [ ] **TASK-NODE-022**: HMAC
- [ ] **TASK-NODE-023**: Ciphers (AES, etc.)
- [ ] **TASK-NODE-024**: Random bytes
- [ ] **TASK-NODE-025**: PBKDF2, scrypt
- [ ] **TASK-NODE-026**: Sign/Verify
- [ ] **TASK-NODE-027**: Key generation
- [ ] **TASK-NODE-028**: X509 certificates

### Phase 5: Child Process

- [ ] **TASK-NODE-029**: spawn
- [ ] **TASK-NODE-030**: spawnSync
- [ ] **TASK-NODE-031**: exec, execSync
- [ ] **TASK-NODE-032**: execFile
- [ ] **TASK-NODE-033**: fork
- [ ] **TASK-NODE-034**: IPC communication

### Phase 6: Streams

- [ ] **TASK-NODE-035**: Readable stream
- [ ] **TASK-NODE-036**: Writable stream
- [ ] **TASK-NODE-037**: Duplex stream
- [ ] **TASK-NODE-038**: Transform stream
- [ ] **TASK-NODE-039**: PassThrough
- [ ] **TASK-NODE-040**: Pipeline, finished

### Phase 7: Network

- [ ] **TASK-NODE-041**: net.Server, net.Socket
- [ ] **TASK-NODE-042**: net.connect
- [ ] **TASK-NODE-043**: dns.lookup
- [ ] **TASK-NODE-044**: dns.resolve*
- [ ] **TASK-NODE-045**: http.Server
- [ ] **TASK-NODE-046**: http.request
- [ ] **TASK-NODE-047**: https module

### Phase 8: Other Modules

- [ ] **TASK-NODE-048**: os module
- [ ] **TASK-NODE-049**: url module
- [ ] **TASK-NODE-050**: querystring module
- [ ] **TASK-NODE-051**: zlib module
- [ ] **TASK-NODE-052**: util module
- [ ] **TASK-NODE-053**: assert module
- [ ] **TASK-NODE-054**: timers module
- [ ] **TASK-NODE-055**: vm module
- [ ] **TASK-NODE-056**: worker_threads module
- [ ] **TASK-NODE-057**: async_hooks module
- [ ] **TASK-NODE-058**: perf_hooks module

## Test Tasks

- [ ] **TEST-NODE-001**: fs tests
- [ ] **TEST-NODE-002**: path tests
- [ ] **TEST-NODE-003**: crypto tests
- [ ] **TEST-NODE-004**: child_process tests
- [ ] **TEST-NODE-005**: stream tests
- [ ] **TEST-NODE-006**: network tests
- [ ] **TEST-NODE-007**: Node.js test262 subset

## Integration Tasks

- [ ] **INT-NODE-001**: Expose via require('node:*')
- [ ] **INT-NODE-002**: process.binding() compatibility
- [ ] **INT-NODE-003**: Module system integration
