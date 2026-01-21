# Module Resolver Specification

## Overview

The module resolver implements Node.js-compatible module resolution with enhancements for TypeScript, JSX, and ESM. It handles import/require resolution, package.json parsing, and path aliasing.

## Bun Reference

- Resolver: `bun-main/src/resolver/resolver.zig`
- Package.json: `bun-main/src/resolver/package_json.zig`
- TSConfig: `bun-main/src/resolver/tsconfig_json.zig`
- Path resolution: `bun-main/src/resolver/resolve_path.zig`
- Dir info: `bun-main/src/resolver/dir_info.zig`
- Data URL: `bun-main/src/resolver/data_url.zig`

## Key Implementation Details

From `resolver.zig`:

### Threadlocal Buffers

The resolver uses threadlocal buffers for performance:

```rust
thread_local! {
    static EXTENSION_PATH: [u8; 512];
    static ESM_SUBPATH: [u8; 512];
    static NODE_MODULES_CHECK: PathBuf;
    static TSCONFIG_MATCH_BUF: PathBuf;
    // ... many more buffer caches
}
```

### Side Effects Tracking

```rust
pub struct SideEffectsData {
    pub source: Source,
    pub range: Range,
    /// If true, "sideEffects" was an array in package.json
    pub is_side_effects_array_in_json: bool,
}

pub enum SideEffects {
    /// Default: conservatively considers all files to have side effects
    HasSideEffects,
    /// Listed as no side effects by package.json
    NoSideEffects_PackageJson,
    /// AST was empty after parsing (e.g., .d.ts files)
    NoSideEffects_EmptyAst,
    /// Loaded using data-oriented loader (text, etc.)
    NoSideEffects_PureData,
}
```

## Public API

### Resolver

```rust
pub struct Resolver {
    options: ResolverOptions,
    fs_cache: FileSystemCache,
    package_json_cache: PackageJsonCache,
    tsconfig_cache: TsConfigCache,
}

pub struct ResolverOptions {
    pub conditions: Vec<String>,          // "import", "require", "browser", etc.
    pub main_fields: Vec<String>,         // "main", "module", "browser"
    pub extensions: Vec<String>,          // ".js", ".ts", ".jsx", ".tsx"
    pub alias: HashMap<String, PathBuf>,  // Path aliases
    pub tsconfig: Option<PathBuf>,        // tsconfig.json path
    pub external: HashSet<String>,        // External packages
    pub preserve_symlinks: bool,
}

impl Resolver {
    pub fn new(options: ResolverOptions) -> Self;
    
    pub fn resolve(
        &self,
        specifier: &str,
        from: &Path,
    ) -> Result<Resolution>;
    
    pub fn resolve_with_kind(
        &self,
        specifier: &str,
        from: &Path,
        kind: ImportKind,
    ) -> Result<Resolution>;
}

/// Resolution result from resolver.zig
pub struct Result {
    pub path_pair: PathPair,
    pub jsx: JsxPragma,
    pub package_json: Option<Arc<PackageJson>>,
    pub diff_case: Option<DifferentCase>,
    pub primary_side_effects_data: SideEffects,
    pub module_type: ModuleType,
    pub debug_meta: Option<DebugMeta>,
    pub dirname_fd: FileDescriptor,
    pub file_fd: FileDescriptor,
    pub import_kind: ImportKind,
    pub flags: ResultFlags,
}

pub struct ResultFlags {
    pub is_external: bool,
    pub is_external_and_rewrite_import_path: bool,
    pub is_standalone_module: bool,
    pub is_from_node_modules: bool,
    pub preserve_unused_imports_ts: bool,
    pub emit_decorator_metadata: bool,
}

pub struct PathPair {
    pub primary: Path,
    pub secondary: Option<Path>,
}

pub enum ImportKind {
    Import,         // ESM import
    Require,        // CommonJS require
    RequireResolve, // require.resolve()
    Dynamic,        // Dynamic import()
    Url,            // new URL()
}
```

### Package.json

```rust
pub struct PackageJson {
    pub name: Option<String>,
    pub version: Option<String>,
    pub main: Option<String>,
    pub module: Option<String>,
    pub browser: Option<BrowserField>,
    pub exports: Option<ExportsField>,
    pub imports: Option<ImportsField>,
    pub type_field: ModuleType,
    pub side_effects: SideEffects,
    pub dependencies: HashMap<String, String>,
    pub dev_dependencies: HashMap<String, String>,
    pub peer_dependencies: HashMap<String, String>,
    pub optional_dependencies: HashMap<String, String>,
    pub bin: Option<BinField>,
    pub scripts: HashMap<String, String>,
}

pub enum ModuleType {
    CommonJS,
    Module,
}

pub enum SideEffects {
    True,                      // Has side effects
    False,                     // No side effects
    Array(Vec<GlobPattern>),   // Only these files have side effects
}

pub struct ExportsField {
    // package.json "exports" field handling
    // Supports conditions, subpaths, patterns
}
```

### TSConfig

```rust
pub struct TsConfig {
    pub compiler_options: CompilerOptions,
    pub include: Vec<GlobPattern>,
    pub exclude: Vec<GlobPattern>,
    pub extends: Option<String>,
}

pub struct CompilerOptions {
    pub base_url: Option<PathBuf>,
    pub paths: HashMap<String, Vec<String>>,
    pub root_dirs: Vec<PathBuf>,
    pub module_resolution: ModuleResolution,
    pub jsx: JsxMode,
    pub jsx_factory: Option<String>,
    pub jsx_fragment_factory: Option<String>,
    pub jsx_import_source: Option<String>,
    pub target: EsTarget,
    pub module: ModuleKind,
    pub strict: bool,
    // ... many more options
}

pub enum ModuleResolution {
    Classic,
    Node,
    Node16,
    NodeNext,
    Bundler,
}
```

## Behavior Specifications

### Resolution Algorithm

1. **Check for built-in modules**: `node:fs`, `bun:*`
2. **Check for data URLs**: `data:text/javascript,...`
3. **Check for absolute paths**: `/path/to/file`
4. **Check for relative paths**: `./file`, `../file`
5. **Check tsconfig paths**: Based on `paths` mapping
6. **Check package imports**: `#internal/*` subpath imports
7. **Resolve as package**: Node.js-style resolution

### Package Resolution Order

1. Check `exports` field (if present)
2. Check condition-specific fields (`browser`, `module`)
3. Check `main` field
4. Check `index.js`

### Exports Field Resolution

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./utils": "./dist/utils.js"
  }
}
```

Conditions checked in order:
1. `bun`
2. `worker`
3. `browser`
4. `development` / `production`
5. `import` / `require`
6. `default`

### Extension Resolution

Try extensions in order:
1. Exact path
2. `.ts`
3. `.tsx`
4. `.mts`
5. `.cts`
6. `.js`
7. `.jsx`
8. `.mjs`
9. `.cjs`
10. `.json`
11. `/index.*` (as directory)

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### Browser Field Handling

```json
{
  "browser": {
    "./node-only.js": "./browser-version.js",
    "fs": false,
    "path": "./path-browserify.js"
  }
}
```

## Edge Cases

### Symlinks

- By default, follow symlinks and resolve to real path
- With `preserveSymlinks: true`, keep the symlink path

### Self-References

Package can import itself using its name:
```js
// In package "my-lib"
import { foo } from "my-lib/utils";
```

### Conditional Exports

Handle all standard conditions plus custom ones

### Circular Dependencies

- Detect and handle circular package.json dependencies
- Allow circular module imports (handled by loader)

### Case Sensitivity

- Case-insensitive matching on case-insensitive filesystems
- Warn when case doesn't match on case-sensitive systems

## Test Requirements

### Unit Tests

- [ ] Relative path resolution
- [ ] Absolute path resolution
- [ ] Package resolution without exports
- [ ] Package resolution with exports
- [ ] Subpath patterns (`*` wildcards)
- [ ] Condition priority
- [ ] Extension resolution order
- [ ] Browser field replacements
- [ ] tsconfig paths resolution
- [ ] baseUrl resolution

### Integration Tests

- [ ] Real package resolution (lodash, react, etc.)
- [ ] Monorepo workspace resolution
- [ ] Symlink handling
- [ ] Case sensitivity edge cases

### Compatibility Tests

- [ ] Match Node.js resolution for common packages
- [ ] Match Bun resolution exactly
