# Package Manager Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
bun-http = { path = "../bun-http" }
tokio = { version = "1.43", features = ["full"] }
semver = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tar = "0.4"
flate2 = "1.0"
sha2 = "0.10"
sha1 = "0.10"
hex = "0.4"
base64 = "0.22"
async-channel = "2.3"
dashmap = "6"
tempfile = "3.14"
```

### Internal Dependencies

- `bun-core`: Error types, file system utilities
- `bun-http`: HTTP client for registry

## Architecture

### Module Structure

```
bun-install/
├── src/
│   ├── lib.rs
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── install.rs
│   │   ├── add.rs
│   │   ├── remove.rs
│   │   ├── update.rs
│   │   ├── link.rs
│   │   ├── publish.rs
│   │   ├── audit.rs
│   │   └── pm.rs
│   ├── lockfile/
│   │   ├── mod.rs
│   │   ├── binary.rs       # bun.lockb format
│   │   ├── text.rs         # bun.lock format
│   │   └── diff.rs
│   ├── registry/
│   │   ├── mod.rs
│   │   ├── npm.rs          # npm registry client
│   │   ├── auth.rs         # Authentication
│   │   └── manifest.rs     # Package manifest types
│   ├── resolve/
│   │   ├── mod.rs
│   │   ├── tree.rs         # Dependency tree
│   │   ├── version.rs      # Version resolution
│   │   └── peer.rs         # Peer dependency handling
│   ├── install/
│   │   ├── mod.rs
│   │   ├── extractor.rs    # Tarball extraction
│   │   ├── linker.rs       # Binary linking
│   │   ├── layout.rs       # node_modules layout
│   │   └── cache.rs        # Package cache
│   ├── scripts/
│   │   ├── mod.rs
│   │   └── runner.rs       # Lifecycle scripts
│   ├── workspace/
│   │   ├── mod.rs
│   │   └── discovery.rs
│   ├── package_json.rs
│   └── semver.rs
└── tests/
    ├── install_tests.rs
    ├── resolve_tests.rs
    └── fixtures/
```

### Key Design Decisions

#### 1. Lockfile Format

Support both binary (bun.lockb) and text (bun.lock) formats:

```rust
pub enum LockfileFormat {
    Binary,  // Fast, compact, default
    Text,    // Human-readable, diffable
}

// Binary format: custom optimized structure
// Text format: JSON-like, compatible with git diff
```

#### 2. Parallel Downloads

```rust
pub struct DownloadPool {
    client: HttpClient,
    semaphore: Semaphore,
    cache: Arc<PackageCache>,
}

impl DownloadPool {
    pub async fn download_all(&self, packages: Vec<PackageSpec>) -> Result<()> {
        let futures: Vec<_> = packages
            .into_iter()
            .map(|pkg| self.download_one(pkg))
            .collect();

        futures::future::try_join_all(futures).await?;
        Ok(())
    }
}
```

#### 3. Content-Addressed Cache

```rust
pub struct PackageCache {
    base_dir: PathBuf,  // ~/.bun/install/cache
}

impl PackageCache {
    pub fn get(&self, integrity: &str) -> Option<PathBuf> {
        let hash_path = self.hash_to_path(integrity);
        if hash_path.exists() {
            Some(hash_path)
        } else {
            None
        }
    }

    pub fn put(&self, integrity: &str, tarball: &[u8]) -> Result<PathBuf> {
        let hash_path = self.hash_to_path(integrity);
        fs::write(&hash_path, tarball)?;
        Ok(hash_path)
    }
}
```

## Implementation Order

### Month 1: Foundation

| Week | Tasks                                |
| ---- | ------------------------------------ |
| 1    | Semver parsing, package.json parsing |
| 2    | Lockfile format (read/write)         |
| 3    | Registry client, manifest fetching   |
| 4    | Tarball downloading, cache           |

### Month 2: Resolution

| Week | Tasks                          |
| ---- | ------------------------------ |
| 1    | Dependency tree building       |
| 2    | Version resolution algorithm   |
| 3    | Peer dependency handling       |
| 4    | Optional/circular dependencies |

### Month 3: Installation

| Week | Tasks                         |
| ---- | ----------------------------- |
| 1    | Tarball extraction            |
| 2    | node_modules layout, hoisting |
| 3    | Binary linking                |
| 4    | Lifecycle scripts             |

### Month 4: Commands & Polish

| Week | Tasks                         |
| ---- | ----------------------------- |
| 1    | install, add, remove commands |
| 2    | Workspaces                    |
| 3    | update, link, unlink          |
| 4    | publish, audit                |

## Risk Analysis

### High Risk

| Risk                           | Mitigation                   |
| ------------------------------ | ---------------------------- |
| Version resolution complexity  | Study npm/pnpm algorithms    |
| Peer dependency conflicts      | Configurable strategies      |
| Performance for large projects | Parallel processing, caching |

### Medium Risk

| Risk                       | Mitigation                   |
| -------------------------- | ---------------------------- |
| Registry API compatibility | Test against real registries |
| Platform-specific issues   | CI testing on all platforms  |

### Low Risk

| Risk                 | Mitigation             |
| -------------------- | ---------------------- |
| Package.json parsing | Well-defined format    |
| Tarball extraction   | Use standard tar crate |

## Performance Targets

- Cold install of React project: < 3s
- Cached install: < 500ms
- Add single package: < 1s
- Resolution for 1000 packages: < 500ms
