# Module Resolver Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
glob = "0.3"
dashmap = "6"
parking_lot = "0.12"
camino = "1.1"
```

### Internal Dependencies

- `bun-core`: Error types, file system cache

## Architecture

### Module Structure

```
bun-resolver/
├── src/
│   ├── lib.rs
│   ├── resolver.rs         # Main resolver logic
│   ├── options.rs          # Resolver options
│   ├── resolution.rs       # Resolution result types
│   ├── package_json/
│   │   ├── mod.rs
│   │   ├── parse.rs        # Parsing logic
│   │   ├── exports.rs      # Exports field handling
│   │   ├── imports.rs      # Imports field handling
│   │   └── browser.rs      # Browser field handling
│   ├── tsconfig/
│   │   ├── mod.rs
│   │   ├── parse.rs        # Parsing logic
│   │   └── paths.rs        # Path mapping
│   ├── cache/
│   │   ├── mod.rs
│   │   ├── fs_cache.rs     # File system cache
│   │   ├── pkg_cache.rs    # Package.json cache
│   │   └── dir_cache.rs    # Directory info cache
│   ├── algorithm/
│   │   ├── mod.rs
│   │   ├── relative.rs     # Relative resolution
│   │   ├── package.rs      # Package resolution
│   │   ├── builtin.rs      # Built-in modules
│   │   └── extensions.rs   # Extension resolution
│   └── util/
│       ├── mod.rs
│       ├── path.rs         # Path utilities
│       └── pattern.rs      # Glob/pattern matching
└── tests/
    ├── resolve_tests.rs
    ├── package_json_tests.rs
    └── fixtures/           # Test packages
```

### Key Design Decisions

#### 1. Caching Strategy

Use a multi-level cache:

```rust
pub struct ResolverCache {
    // Resolved paths cache
    resolution_cache: DashMap<CacheKey, Arc<Resolution>>,

    // Package.json cache by directory
    package_json_cache: DashMap<PathBuf, Option<Arc<PackageJson>>>,

    // Directory entries cache
    dir_entries_cache: DashMap<PathBuf, Arc<Vec<DirEntry>>>,

    // Real path cache (for symlinks)
    real_path_cache: DashMap<PathBuf, PathBuf>,
}

#[derive(Hash, Eq, PartialEq)]
struct CacheKey {
    specifier: String,
    from: PathBuf,
    kind: ImportKind,
}
```

#### 2. Exports Field Matching

```rust
pub enum ExportsValue {
    String(String),
    Conditions(HashMap<String, ExportsValue>),
    Array(Vec<ExportsValue>),
    Null,
}

impl ExportsField {
    pub fn resolve(
        &self,
        subpath: &str,
        conditions: &[&str],
    ) -> Option<String> {
        // Implementation follows Node.js algorithm
    }
}
```

#### 3. Thread Safety

All caches use `DashMap` for concurrent access without global locks.

## Implementation Order

### Week 1-2: Foundation

1. Create crate structure
2. Define types (Resolution, Options, etc.)
3. Implement basic relative path resolution
4. Implement extension resolution

### Week 3-4: Package.json

1. Parse basic package.json
2. Implement main/module field resolution
3. Implement exports field (string)
4. Implement exports field (conditions)
5. Implement subpath patterns

### Week 5-6: TSConfig

1. Parse tsconfig.json
2. Handle extends
3. Implement paths mapping
4. Implement baseUrl resolution

### Week 7-8: Polish

1. Implement caching
2. Handle edge cases (symlinks, case sensitivity)
3. Performance optimization
4. Comprehensive testing

## Risk Analysis

### High Risk

| Risk                            | Mitigation                                           |
| ------------------------------- | ---------------------------------------------------- |
| Exports field complexity        | Extensive test coverage, follow Node.js spec exactly |
| Performance for large monorepos | Aggressive caching, parallel resolution              |

### Medium Risk

| Risk                    | Mitigation                               |
| ----------------------- | ---------------------------------------- |
| TSConfig extends chains | Limit depth, cache results               |
| Symlink edge cases      | Real path caching, careful normalization |

### Low Risk

| Risk             | Mitigation                |
| ---------------- | ------------------------- |
| Basic resolution | Well-documented algorithm |
| Extension order  | Match Bun exactly         |

## Performance Targets

- Resolve single module: < 100μs (cached), < 1ms (uncached)
- Cold start resolution of large project (1000 modules): < 100ms
- Memory usage: < 50MB for typical project cache
