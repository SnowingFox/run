# Package Manager Specification

## Overview

The package manager module implements a npm-compatible package manager with support for lockfiles, workspaces, lifecycle scripts, and the npm registry. It aims to be a drop-in replacement for npm/yarn/pnpm.

## Bun Reference

- Install: `bun-main/src/install/install.zig`
- Package Manager: `bun-main/src/install/PackageManager.zig`
- Lockfile: `bun-main/src/install/lockfile/`
- npm registry: `bun-main/src/install/npm.zig`
- Lifecycle scripts: `bun-main/src/install/lifecycle_script_runner.zig`
- CLI commands: `bun-main/src/cli/install_command.zig`, etc.

## Public API

### Install Command

```rust
pub async fn install(options: InstallOptions) -> Result<InstallResult>;

pub struct InstallOptions {
    pub cwd: PathBuf,
    pub production: bool,
    pub dev: bool,
    pub optional: bool,
    pub frozen_lockfile: bool,
    pub ignore_scripts: bool,
    pub no_save: bool,
    pub save_exact: bool,
    pub global: bool,
    pub force: bool,
    pub dry_run: bool,
    pub concurrent_downloads: usize,
    pub registry: Option<String>,
}

pub struct InstallResult {
    pub added: Vec<PackageInfo>,
    pub removed: Vec<PackageInfo>,
    pub updated: Vec<PackageInfo>,
    pub audit: Option<AuditResult>,
}
```

### Add/Remove Commands

```rust
pub async fn add(packages: Vec<PackageSpec>, options: AddOptions) -> Result<()>;
pub async fn remove(packages: Vec<String>, options: RemoveOptions) -> Result<()>;

pub struct PackageSpec {
    pub name: String,
    pub version: Option<VersionRange>,
    pub alias: Option<String>,
}

pub struct AddOptions {
    pub dev: bool,
    pub optional: bool,
    pub peer: bool,
    pub exact: bool,
    pub workspace: Option<String>,
}
```

### Lockfile

Based on `bun.lockb.zig`:

```rust
/// Binary lockfile format header
pub const LOCKFILE_VERSION: &[u8] = b"#!/usr/bin/env bun\nbun-lockfile-format-v0\n";

/// Special tags for extended lockfile sections
pub const HAS_PATCHED_DEPENDENCIES_TAG: u64 = /* "pAtChEdD" */;
pub const HAS_WORKSPACE_PACKAGE_IDS_TAG: u64 = /* "wOrKsPaC" */;
pub const HAS_TRUSTED_DEPENDENCIES_TAG: u64 = /* "tRuStEDd" */;
pub const HAS_EMPTY_TRUSTED_DEPENDENCIES_TAG: u64 = /* "eMpTrUsT" */;
pub const HAS_OVERRIDES_TAG: u64 = /* "oVeRriDs" */;
pub const HAS_CATALOGS_TAG: u64 = /* "cAtAlOgS" */;
pub const HAS_CONFIG_VERSION_TAG: u64 = /* "cNfGvRsN" */;

pub struct Lockfile {
    pub format: LockfileFormat,
    pub meta_hash: [u8; 32],
    pub packages: PackageList,
    pub buffers: Buffers,
    pub workspace_versions: HashMap<PackageNameHash, SemverVersion>,
    pub workspace_paths: HashMap<PackageNameHash, String>,
    pub trusted_dependencies: Option<HashSet<u32>>,
    pub overrides: OverrideMap,
    pub patched_dependencies: HashMap<PackageNameAndVersionHash, PatchedDep>,
    pub catalogs: Catalogs,
}

pub struct LockedPackage {
    pub version: String,
    pub resolved: String,
    pub integrity: String,
    pub dependencies: HashMap<String, String>,
    pub optional_dependencies: HashMap<String, String>,
    pub peer_dependencies: HashMap<String, String>,
    pub bin: Option<BinField>,
    pub os: Option<Vec<String>>,
    pub cpu: Option<Vec<String>>,
}

impl Lockfile {
    pub fn read(path: &Path) -> Result<Self>;
    pub fn write(&self, path: &Path) -> Result<()>;
    pub fn diff(&self, other: &Lockfile) -> LockfileDiff;
    /// Save with zeroed memory for consistent hashing
    pub fn save(&self, options: &PackageManagerOptions, bytes: &mut Vec<u8>) -> Result<()>;
}

/// Resolution types for different package sources
pub enum Resolution {
    Npm { version: SemverVersion, url: String },
    Git { repo: Repository },
    Github { owner: String, repo: String, committish: String },
    LocalTarball { path: String },
    RemoteTarball { url: String },
    Folder { path: String },
    Workspace { path: String },
    Symlink { path: String },
    Root,
}
```

### NPM Registry Client

```rust
pub struct NpmRegistry {
    base_url: String,
    token: Option<String>,
    client: HttpClient,
}

impl NpmRegistry {
    pub async fn fetch_package(&self, name: &str) -> Result<PackageManifest>;
    pub async fn fetch_version(&self, name: &str, version: &str) -> Result<PackageVersion>;
    pub async fn download_tarball(&self, url: &str) -> Result<TarballStream>;
    pub async fn publish(&self, tarball: &[u8], metadata: PublishMetadata) -> Result<()>;
}

pub struct PackageManifest {
    pub name: String,
    pub versions: HashMap<String, PackageVersion>,
    pub dist_tags: HashMap<String, String>,
    pub time: HashMap<String, DateTime>,
}
```

### Workspaces

```rust
pub struct Workspace {
    pub root: PathBuf,
    pub packages: Vec<WorkspacePackage>,
}

pub struct WorkspacePackage {
    pub name: String,
    pub path: PathBuf,
    pub version: String,
    pub dependencies: HashMap<String, String>,
}

impl Workspace {
    pub fn discover(root: &Path) -> Result<Self>;
    pub fn filter(&self, pattern: &str) -> Vec<&WorkspacePackage>;
}
```

## Behavior Specifications

### Installation Algorithm

1. Read package.json and lockfile
2. Build dependency tree with version resolution
3. Detect changes from lockfile
4. Download missing packages (parallel)
5. Extract to node_modules
6. Link binaries
7. Run lifecycle scripts (postinstall, etc.)
8. Update lockfile

### Version Resolution

- Semver range matching
- Peer dependency resolution
- Optional dependency handling
- Workspace protocol (`workspace:*`)
- Git dependencies
- URL dependencies
- Local file dependencies

### node_modules Structure

Default: hoisted structure (like npm v7+)

- Hoist shared dependencies
- Handle version conflicts
- Preserve correct resolution paths

### Global Cache

Location: `~/.bun/install/cache/`

- Content-addressed storage
- Hard links to node_modules
- Cache cleanup commands

### Lifecycle Scripts

Order: `preinstall` → install packages → `postinstall` → `prepare`

Scripts are run:

- In dependency order
- With timeout protection
- With environment variables

### Binary Linking

- Create .bin directory in node_modules
- Link package binaries
- Handle Windows shims

## Edge Cases

### Peer Dependencies

- Auto-install peer dependencies
- Handle peer dependency conflicts
- Warn on missing optional peers

### Optional Dependencies

- Skip failed optional dependencies
- Platform-specific optionals (os, cpu)

### Circular Dependencies

- Detect and handle cycles
- Provide warning but allow install

### Corrupt Cache

- Verify integrity on install
- Rebuild corrupted entries

## Test Requirements

### Unit Tests

- [ ] Version range parsing
- [ ] Semver comparison
- [ ] Lockfile parsing/writing
- [ ] Dependency tree resolution
- [ ] Workspace discovery

### Integration Tests

- [ ] Full install cycle
- [ ] Add/remove packages
- [ ] Workspace installs
- [ ] Lifecycle script execution
- [ ] Registry authentication

### Compatibility Tests

- [ ] Install popular packages
- [ ] Compare lockfile with npm/yarn
- [ ] Verify node_modules structure
