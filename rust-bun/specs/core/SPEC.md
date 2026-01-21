# Core Runtime Specification

## Overview

The core runtime module provides the foundational infrastructure for Rust-Bun, including memory management, environment handling, CLI orchestration, and the main entry point.

## Bun Reference

- Entry point: `bun-main/src/bun.zig`
- CLI: `bun-main/src/cli.zig`
- Environment: `bun-main/src/env.zig`, `bun-main/src/env_var.zig`
- Allocators: `bun-main/src/allocators/`
- Feature flags: `bun-main/src/feature_flags.zig`

## Public API

### Entry Point

```rust
pub fn main() -> Result<()>;
```

### CLI Commands

```rust
pub enum Command {
    Run(RunOptions),
    Build(BuildOptions),
    Install(InstallOptions),
    Add(AddOptions),
    Remove(RemoveOptions),
    Update(UpdateOptions),
    Test(TestOptions),
    Init(InitOptions),
    Create(CreateOptions),
    Upgrade(UpgradeOptions),
    Bunx(BunxOptions),
    Link(LinkOptions),
    Unlink(UnlinkOptions),
    Pm(PmOptions),
    Exec(ExecOptions),
    Repl,
    Help,
    Version,
}
```

### Environment

```rust
pub struct Environment {
    pub is_debug: bool,
    pub is_release: bool,
    pub enable_asan: bool,
    pub is_ci: bool,
    pub is_docker: bool,
    pub home_dir: PathBuf,
    pub cwd: PathBuf,
    pub temp_dir: PathBuf,
}

pub struct EnvironmentVariables {
    pub node_env: Option<String>,
    pub bun_install: Option<PathBuf>,
    pub path: Vec<PathBuf>,
    // ... other env vars
}
```

### Memory Management

Based on Bun's allocator design in `bun.zig`:

```rust
/// Default allocator - uses mimalloc in release, debug allocator in debug builds
pub static DEFAULT_ALLOCATOR: &dyn Allocator;

/// Zeroing allocator - guarantees zeroed memory (used for lockfile serialization)
pub static Z_ALLOCATOR: &dyn Allocator;

/// Debug allocator - tracks allocations and catches leaks (debug builds only)
#[cfg(debug_assertions)]
pub static DEBUG_ALLOCATOR: DebugAllocator;

pub trait Allocator: Send + Sync {
    fn allocate(&self, size: usize, alignment: usize) -> *mut u8;
    fn deallocate(&self, ptr: *mut u8, size: usize, alignment: usize);
    fn reallocate(&self, ptr: *mut u8, old_size: usize, new_size: usize, alignment: usize) -> *mut u8;
    fn remap(&self, mem: &[u8], alignment: usize, new_len: usize) -> Option<*mut u8>;
}

pub struct MimallocAllocator;
pub struct ArenaAllocator;
pub struct DebugAllocator {
    backing: Option<std::alloc::System>,
}

/// Typed allocator for heap breakdown analysis
pub fn typed_allocator<T>() -> impl Allocator;

/// Named allocator for profiling
pub fn named_allocator(name: &'static str) -> impl Allocator;

/// Threadlocal heaps for bundler (arena-style, freed at end of job)
pub struct ThreadLocalHeap;
```

### Feature Flags

Based on `env.zig` and `build_options`:

```rust
pub struct FeatureFlags {
    pub enable_auto_install: bool,
    pub enable_macro: bool,
    pub enable_bun_native_bundler: bool,
    pub force_bun_install: bool,
    pub is_canary: bool,
    pub enable_simd: bool,
    pub enable_asan: bool,
    pub enable_logs: bool,
    pub dump_source: bool,
}

/// Build-time environment from build_options
pub struct BuildEnvironment {
    pub is_debug: bool,
    pub is_release: bool,
    pub is_test: bool,
    pub is_mac: bool,
    pub is_linux: bool,
    pub is_windows: bool,
    pub is_posix: bool,
    pub is_aarch64: bool,
    pub is_x64: bool,
    pub is_musl: bool,
    pub reported_nodejs_version: &'static str,
    pub git_sha: &'static str,
    pub version: semver::Version,
}
```

### Error Types

Based on Bun's JSError pattern:

```rust
/// JavaScript errors that can be thrown
#[derive(Debug)]
pub enum JSError {
    /// There is an active exception on the global object
    JSError,
    /// Out of memory
    OutOfMemory,
    /// JavaScript execution has been terminated
    JSTerminated,
}

pub type JSOOM = Result<(), JSError>;
```

## Behavior Specifications

### Startup Sequence

1. Parse command-line arguments
2. Initialize logging based on environment
3. Load environment variables from `.env` files (if present)
4. Determine command to execute
5. Initialize appropriate allocator
6. Execute command
7. Handle errors and exit codes

### Environment Variable Loading

Order of precedence (highest first):

1. Command-line arguments
2. Process environment variables
3. `.env.local`
4. `.env.[mode].local` (if mode is set)
5. `.env.[mode]`
6. `.env`

### Exit Codes

- `0`: Success
- `1`: General error
- `2`: Invalid usage
- `126`: Command not executable
- `127`: Command not found

## Edge Cases

### Path Handling

- Handle Unicode paths correctly on all platforms
- Normalize path separators (/ vs \)
- Handle symlinks properly
- Handle very long paths on Windows

### Memory

- Track allocations in debug mode
- Handle out-of-memory gracefully
- Clean up resources on panic

### Signals

- Handle SIGINT (Ctrl+C) gracefully
- Handle SIGTERM for clean shutdown
- Handle SIGHUP for reload (where applicable)

## Test Requirements

### Unit Tests

- [ ] CLI argument parsing for all commands
- [ ] Environment variable loading order
- [ ] Allocator correctness
- [ ] Feature flag parsing
- [ ] Exit code mapping

### Integration Tests

- [ ] Full startup/shutdown cycle
- [ ] Signal handling
- [ ] Environment inheritance to child processes
- [ ] Working directory changes

### Edge Case Tests

- [ ] Empty arguments
- [ ] Invalid UTF-8 in paths
- [ ] Missing home directory
- [ ] Read-only file system operations
