# Bundler Specification

## Overview

The bundler module implements a high-performance JavaScript/TypeScript bundler with tree-shaking, code splitting, CSS processing, and HTML entry point support. It's designed to be compatible with Bun's `Bun.build()` API.

## Bun Reference

- Bundle V2: `bun-main/src/bundler/bundle_v2.zig`
- Linker Context: `bun-main/src/bundler/LinkerContext.zig`
- Graph: `bun-main/src/bundler/Graph.zig`
- Chunk: `bun-main/src/bundler/Chunk.zig`
- Thread Pool: `bun-main/src/bundler/ThreadPool.zig`
- Parse Task: `bun-main/src/bundler/ParseTask.zig`

## Memory Management Strategy

From `bundle_v2.zig`:

> Bun's bundler relies on mimalloc's threadlocal heaps as arena allocators.
> When a new thread is spawned for a bundling job, it is given a threadlocal heap
> and all allocations are done on that heap. When the job is done, the
> threadlocal heap is destroyed and all memory is freed.

Key constraints:

- Threadlocal heaps cannot allocate on different threads (segfault)
- Globally shared data (package.json, tsconfig.json) must use global allocator
- `LinkerContext` allocator is also threadlocal

## Public API

### Build Function

```rust
pub async fn build(options: BuildOptions) -> Result<BuildOutput>;

pub struct BuildOptions {
    pub entrypoints: Vec<PathBuf>,
    pub outdir: Option<PathBuf>,
    pub target: Target,
    pub format: Format,
    pub minify: MinifyOptions,
    pub sourcemap: SourceMapOption,
    pub splitting: bool,
    pub plugins: Vec<Box<dyn Plugin>>,
    pub external: Vec<String>,
    pub define: HashMap<String, String>,
    pub loader: HashMap<String, Loader>,
    pub naming: NamingOptions,
    pub public_path: Option<String>,
    pub tree_shaking: bool,
    pub drop: Vec<String>,
    pub banner: Option<String>,
    pub footer: Option<String>,
}

/// The core BundleV2 structure (from bundle_v2.zig)
pub struct BundleV2 {
    pub transpiler: Transpiler,
    /// For Server Component support - separate client transpiler
    pub client_transpiler: Option<Transpiler>,
    /// SSR-specific transpiler (for bake.Framework.ServerComponents.separate_ssr_graph)
    pub ssr_transpiler: Transpiler,
    /// Framework configuration (Bake)
    pub framework: Option<Framework>,
    pub graph: Graph,
    pub linker: LinkerContext,
    pub plugins: Option<PluginManager>,
    /// File map for in-memory files
    pub file_map: Option<FileMap>,
    /// Tracks dynamic import entry points
    pub dynamic_import_entry_points: HashMap<u32, ()>,
    /// Track if any module has top-level await (for TLA validation)
    pub has_any_top_level_await_modules: bool,
}

pub struct BuildOutput {
    pub outputs: Vec<BuildArtifact>,
    pub logs: Vec<BuildMessage>,
}

pub struct BuildArtifact {
    pub path: PathBuf,
    pub kind: ArtifactKind,
    pub hash: Option<String>,
    pub loader: Loader,
    pub sourcemap: Option<BuildArtifact>,
}

pub enum ArtifactKind {
    EntryPoint,
    Chunk,
    Asset,
    SourceMap,
}
```

### Targets and Formats

```rust
pub enum Target {
    Browser,
    Bun,
    Node,
}

pub enum Format {
    Esm,
    Cjs,
    Iife,
}

pub enum Loader {
    Js,
    Jsx,
    Ts,
    Tsx,
    Json,
    Toml,
    Text,
    File,
    Base64,
    DataUrl,
    Css,
    Empty,
}
```

### Minification Options

```rust
pub struct MinifyOptions {
    pub whitespace: bool,
    pub identifiers: bool,
    pub syntax: bool,
}

impl Default for MinifyOptions {
    fn default() -> Self {
        Self {
            whitespace: true,
            identifiers: true,
            syntax: true,
        }
    }
}
```

### Source Maps

```rust
pub enum SourceMapOption {
    None,
    Linked,     // Separate file with //# sourceMappingURL
    Inline,     // Inline data URL
    External,   // Separate file, no link
    Both,       // Both inline and external
}
```

### Plugin System

```rust
#[async_trait]
pub trait Plugin: Send + Sync {
    fn name(&self) -> &str;

    fn setup(&self, build: &mut PluginBuild);
}

pub struct PluginBuild {
    // Register callbacks
}

pub struct OnResolveArgs {
    pub path: String,
    pub importer: Option<PathBuf>,
    pub namespace: String,
    pub resolve_dir: PathBuf,
    pub kind: ImportKind,
}

pub struct OnResolveResult {
    pub path: Option<PathBuf>,
    pub external: bool,
    pub namespace: Option<String>,
    pub side_effects: Option<bool>,
}

pub struct OnLoadArgs {
    pub path: PathBuf,
    pub namespace: String,
}

pub struct OnLoadResult {
    pub contents: String,
    pub loader: Option<Loader>,
    pub resolve_dir: Option<PathBuf>,
}
```

## Behavior Specifications

### Build Pipeline

1. **Entry Point Analysis**: Parse entry points, build initial import graph
2. **Module Resolution**: Resolve all imports recursively
3. **Parsing**: Parse all modules in parallel
4. **Linking**: Analyze exports, resolve bindings
5. **Tree Shaking**: Mark used code, remove dead code
6. **Code Splitting**: Split into chunks based on dynamic imports
7. **Minification**: Optimize and minify (if enabled)
8. **Code Generation**: Generate output files
9. **Source Map Generation**: Create source maps

### Tree Shaking Algorithm

Based on ESBuild's approach:

1. Start with entry point exports
2. Recursively mark all referenced symbols
3. Remove unmarked statements/expressions
4. Handle side effects (sideEffects field in package.json)

### Code Splitting

- Automatic splitting at dynamic import boundaries
- Shared chunks for common dependencies
- Manual control via dynamic import

### CSS Bundling

- Parse CSS with full selector support
- Handle @import statements
- CSS Modules support
- Vendor prefix injection
- Minification

### HTML Entry Points

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="./app.ts"></script>
    <link rel="stylesheet" href="./styles.css" />
  </head>
</html>
```

- Automatically bundle referenced scripts
- Bundle stylesheets
- Update paths in output HTML

## Edge Cases

### Circular Dependencies

- Detect and handle circular imports
- Preserve execution order semantics
- Warning for potential issues

### Dynamic Imports with Variables

```js
import(`./locale/${lang}.json`);
```

- Glob pattern expansion
- Create chunk for each matched file

### CommonJS/ESM Interop

- Handle `module.exports` assignment
- Handle `__esModule` flag
- Synthetic default exports

### Side Effects

- Respect `sideEffects` in package.json
- Preserve side-effectful imports
- Handle re-exports with side effects

## Test Requirements

### Unit Tests

- [ ] Parse task for all loaders
- [ ] Tree shaking correctness
- [ ] Code splitting boundaries
- [ ] Source map accuracy
- [ ] Minification correctness

### Integration Tests

- [ ] Bundle real projects (React app, Vue app)
- [ ] CSS bundling with imports
- [ ] HTML entry points
- [ ] Plugin system
- [ ] Watch mode rebuilds

### Performance Tests

- [ ] Bundle three.js < 2s
- [ ] Bundle 1000 modules < 5s
- [ ] Memory usage < 500MB for large projects

### Compatibility Tests

- [ ] Match Bun.build() output
- [ ] Match esbuild for common cases
