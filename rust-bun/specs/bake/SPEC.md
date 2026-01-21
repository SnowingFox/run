# Bake (SSR Framework) Specification

## Overview

Bake is Bun's server-side rendering framework with support for React, file-based routing, HMR, and production builds.

From `DevServer.zig`:

> Instance of the development server. Attaches to an instance of `Bun.serve`,
> controlling bundler, routing, and hot module reloading.
> Reprocessing files that did not change is banned; by having perfect
> incremental tracking over the project, editing a file's contents must always
> rebundle only that one file.

## Bun Reference

- DevServer: `bun-main/src/bake/DevServer.zig`
- FrameworkRouter: `bun-main/src/bake/FrameworkRouter.zig`
- Production: `bun-main/src/bake/production.zig`
- React Framework: `bun-main/src/bake/bun-framework-react/`
- Client HMR: `bun-main/src/bake/client/`
- IncrementalGraph: `bun-main/src/bake/DevServer/IncrementalGraph.zig`
- Assets: `bun-main/src/bake/DevServer/Assets.zig`
- SourceMapStore: `bun-main/src/bake/DevServer/SourceMapStore.zig`

## Public API

```rust
pub struct DevServer {
    /// Arena allocator (must live until DevServer.deinit())
    allocation_scope: AllocationScope,
    /// Absolute path to project root
    root: PathBuf,
    /// Unique ID for debugger protocol
    inspector_server_id: DebuggerId,
    /// Hash of framework config + bun revision (forces reload on mismatch)
    configuration_hash_key: [u8; 16],
    /// Virtual machine for JS execution
    vm: VirtualMachine,
    /// HTTP server attachment
    server: Option<AnyServer>,
    /// Route tree
    router: FrameworkRouter,
    /// Route bundle state
    route_bundles: Vec<RouteBundle>,
    /// Incremental graphs for client/server
    client_graph: IncrementalGraph,
    server_graph: IncrementalGraph,
    /// Assets served via `/_bun/asset/<key>`
    assets: Assets,
    /// Source map storage
    source_maps: SourceMapStore,
    /// Bundling failures stored in wire format
    bundling_failures: HashMap<SerializedFailure, ()>,
    /// If true, acts purely as frontend bundler
    frontend_only: bool,
}

pub struct DevServerOptions {
    pub arena: Allocator,
    pub root: PathBuf,
    pub vm: VirtualMachine,
    pub framework: Framework,
    pub bundler_options: SplitBundlerOptions,
    pub broadcast_console_log_from_browser_to_server: bool,
    /// Debug: dump sources to .bake-debug
    pub dump_sources: Option<PathBuf>,
}

impl DevServer {
    pub fn new(options: DevServerOptions) -> Result<Self>;
    pub async fn start(&self) -> Result<()>;
    pub async fn stop(&self);
    pub fn reload(&self);
}
```

### Framework Router

Based on `FrameworkRouter.zig`:

```rust
/// Discovers routes from filesystem based on framework configuration
pub struct FrameworkRouter {
    /// Absolute path to router root
    pub root: PathBuf,
    /// Route type configurations
    pub types: Vec<RouteType>,
    /// All discovered routes
    pub routes: Vec<Route>,
    /// Static routes (full URL -> Route Index)
    pub static_routes: HashMap<String, RouteIndex>,
    /// Dynamic routes for pattern matching
    pub dynamic_routes: HashMap<EncodedPattern, RouteIndex>,
}

pub struct Route {
    pub part: RoutePart,
    pub route_type: RouteTypeIndex,
    pub parent: Option<RouteIndex>,
    pub first_child: Option<RouteIndex>,
    pub prev_sibling: Option<RouteIndex>,
    pub next_sibling: Option<RouteIndex>,
    /// Page component file
    pub file_page: Option<OpaqueFileId>,
    /// Layout component file
    pub file_layout: Option<OpaqueFileId>,
    /// Route bundle (if navigatable and requested)
    pub bundle: Option<RouteBundleIndex>,
}

pub struct RouteType {
    pub abs_root: PathBuf,
    pub prefix: String,  // default "/"
    pub ignore_underscores: bool,
    pub ignore_dirs: Vec<String>,  // default [".git", "node_modules"]
    pub extensions: Vec<String>,
    pub style: RoutingStyle,
    pub allow_layouts: bool,
}

pub enum RoutingStyle {
    NextJsPages,
    NextJsApp,
    Custom,
}
```

### Incremental Graph

```rust
/// Tracks module dependencies for incremental rebuilds
pub struct IncrementalGraph {
    /// Files indexed by path
    files: HashMap<PathBuf, FileIndex>,
    /// Module dependency edges
    dependencies: HashMap<FileIndex, Vec<FileIndex>>,
    /// Reverse dependencies for invalidation
    dependents: HashMap<FileIndex, Vec<FileIndex>>,
}
```

## Features

- File-based routing (pages/, app/)
- Layout nesting with cascading
- Server components (React) with "use client" boundaries
- Incremental bundling (only rebuild changed files)
- HMR via WebSocket with error overlay
- Production bundling with code splitting
- Static generation / prerendering
- Streaming SSR with React Suspense
- Source map serving
- Asset serving (`/_bun/asset/`)
- Tailwind CSS plugin integration

## Production Build

From `production.zig`:

```rust
pub fn build_command(ctx: CommandContext) -> Result<()>;

pub struct PerThread {
    pub input_files: Vec<InputFile>,
    pub bundled_outputs: Vec<OutputFile>,
    pub output_indexes: Vec<OutputIndex>,
    pub module_keys: Vec<String>,
    pub module_map: HashMap<String, ModuleIndex>,
    pub source_maps: HashMap<String, OutputFileIndex>,
    pub vm: VirtualMachine,
    pub loaded_files: BitSet,
}
```

## Test Requirements

- [ ] Route discovery with various styles
- [ ] Layout nesting and cascading
- [ ] SSR rendering with streaming
- [ ] HMR updates (file change → WebSocket → client update)
- [ ] Incremental bundling (only changed files)
- [ ] Production builds with code splitting
- [ ] Source map generation and serving
- [ ] Error overlay display
