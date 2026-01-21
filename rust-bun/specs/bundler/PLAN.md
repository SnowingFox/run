# Bundler Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
bun-parser = { path = "../bun-parser" }
bun-resolver = { path = "../bun-resolver" }
bun-css = { path = "../bun-css" }
tokio = { version = "1.43", features = ["full"] }
rayon = "1.10"
dashmap = "6"
parking_lot = "0.12"
async-trait = "0.1"
sourcemap = "9"
notify = "8"
```

### Internal Dependencies

- `bun-core`: Error types, allocators
- `bun-parser`: JS/TS parsing
- `bun-resolver`: Module resolution
- `bun-css`: CSS parsing and bundling

## Architecture

### Module Structure

```
bun-bundler/
├── src/
│   ├── lib.rs
│   ├── build.rs            # Main build function
│   ├── options.rs          # Build options
│   ├── output.rs           # Build output types
│   ├── graph/
│   │   ├── mod.rs
│   │   ├── module.rs       # Module representation
│   │   ├── dependency.rs   # Dependency tracking
│   │   └── builder.rs      # Graph construction
│   ├── parse/
│   │   ├── mod.rs
│   │   ├── task.rs         # Parse task
│   │   └── worker.rs       # Parse worker pool
│   ├── link/
│   │   ├── mod.rs
│   │   ├── context.rs      # Linker context
│   │   ├── symbol.rs       # Symbol table
│   │   ├── binding.rs      # Import/export binding
│   │   └── interop.rs      # CJS/ESM interop
│   ├── treeshake/
│   │   ├── mod.rs
│   │   ├── marker.rs       # Usage marking
│   │   └── eliminator.rs   # Dead code elimination
│   ├── chunk/
│   │   ├── mod.rs
│   │   ├── splitter.rs     # Code splitting
│   │   └── generator.rs    # Chunk generation
│   ├── codegen/
│   │   ├── mod.rs
│   │   ├── esm.rs          # ESM output
│   │   ├── cjs.rs          # CJS output
│   │   ├── iife.rs         # IIFE output
│   │   └── runtime.rs      # Runtime helpers
│   ├── minify/
│   │   ├── mod.rs
│   │   ├── whitespace.rs
│   │   ├── mangle.rs
│   │   └── optimize.rs
│   ├── sourcemap/
│   │   ├── mod.rs
│   │   └── builder.rs
│   ├── plugin/
│   │   ├── mod.rs
│   │   ├── trait.rs        # Plugin trait
│   │   └── hooks.rs        # Hook implementations
│   ├── loader/
│   │   ├── mod.rs
│   │   ├── js.rs
│   │   ├── json.rs
│   │   ├── css.rs
│   │   ├── text.rs
│   │   └── asset.rs
│   └── html/
│       ├── mod.rs
│       └── entry.rs        # HTML entry handling
└── tests/
    ├── bundle_tests.rs
    ├── treeshake_tests.rs
    └── fixtures/
```

### Key Design Decisions

#### 1. Parallel Processing Model

```rust
pub struct BundleGraph {
    modules: DashMap<ModuleId, Module>,
    pending_parses: Arc<AtomicUsize>,
}

impl BundleGraph {
    pub async fn build_from_entries(entries: Vec<PathBuf>) -> Result<Self> {
        let graph = Self::new();
        let (tx, rx) = async_channel::unbounded();

        // Spawn parse workers
        for _ in 0..num_cpus::get() {
            let graph_clone = graph.clone();
            let rx = rx.clone();
            tokio::spawn(async move {
                while let Ok(task) = rx.recv().await {
                    graph_clone.process_parse_task(task).await;
                }
            });
        }

        // Queue initial entries
        for entry in entries {
            tx.send(ParseTask::Entry(entry)).await?;
        }

        // Wait for all parses to complete
        graph.wait_for_completion().await;

        Ok(graph)
    }
}
```

#### 2. Symbol Table Design

```rust
pub struct SymbolTable {
    // Local symbols per module
    locals: HashMap<ModuleId, Vec<Symbol>>,

    // Export bindings: (module, export_name) -> symbol
    exports: HashMap<(ModuleId, String), SymbolRef>,

    // Import bindings: (module, import_ref) -> resolved symbol
    imports: HashMap<(ModuleId, ImportRef), SymbolRef>,
}

#[derive(Clone, Copy)]
pub struct SymbolRef {
    module_id: ModuleId,
    local_index: u32,
}
```

#### 3. Tree Shaking State Machine

```rust
pub struct TreeShaker {
    // Live symbols
    live: HashSet<SymbolRef>,

    // Work queue
    queue: VecDeque<SymbolRef>,

    // Side effect tracking
    side_effects: HashSet<ModuleId>,
}

impl TreeShaker {
    pub fn shake(&mut self, graph: &BundleGraph) {
        // 1. Seed with entry exports
        for entry in &graph.entries {
            self.mark_module_exports(entry);
        }

        // 2. Propagate liveness
        while let Some(sym) = self.queue.pop_front() {
            self.process_symbol(graph, sym);
        }

        // 3. Remove dead code
        for module in graph.modules.values_mut() {
            self.eliminate_dead(module);
        }
    }
}
```

## Implementation Order

### Month 1: Graph Building

| Week | Tasks                                      |
| ---- | ------------------------------------------ |
| 1    | Core infrastructure, options, output types |
| 2    | Parse task, parallel processing            |
| 3    | Import/export extraction, graph building   |
| 4    | Dependency tracking, circular handling     |

### Month 2: Linking & Tree Shaking

| Week | Tasks                           |
| ---- | ------------------------------- |
| 1    | Symbol table, export resolution |
| 2    | Import binding, re-exports      |
| 3    | Tree shaking marker             |
| 4    | Dead code elimination           |

### Month 3: Code Generation

| Week | Tasks                             |
| ---- | --------------------------------- |
| 1    | Code splitting, chunk computation |
| 2    | ESM output format                 |
| 3    | CJS/IIFE output formats           |
| 4    | Runtime helper injection          |

### Month 4: Advanced Features

| Week | Tasks           |
| ---- | --------------- |
| 1    | Minification    |
| 2    | Source maps     |
| 3    | Plugin system   |
| 4    | CSS integration |

### Month 5: HTML & Polish

| Week | Tasks                    |
| ---- | ------------------------ |
| 1    | HTML entry points        |
| 2    | Watch mode               |
| 3    | Performance optimization |
| 4    | Testing, documentation   |

## Risk Analysis

### High Risk

| Risk                           | Mitigation                                    |
| ------------------------------ | --------------------------------------------- |
| Tree shaking correctness       | Extensive test suite, comparison with esbuild |
| Performance for large projects | Parallel processing, caching, profiling       |
| CJS/ESM interop edge cases     | Match Node.js semantics exactly               |

### Medium Risk

| Risk                      | Mitigation              |
| ------------------------- | ----------------------- |
| Plugin API compatibility  | Match Bun's API closely |
| Code splitting heuristics | Configurable options    |

### Low Risk

| Risk                     | Mitigation                  |
| ------------------------ | --------------------------- |
| Basic bundling           | Well-established algorithms |
| Output format generation | Follow ESM/CJS specs        |

## Performance Targets

- Bundle three.js (1.2MB): < 2s
- Bundle React + dependencies: < 500ms
- Bundle 1000 small modules: < 3s
- Memory usage: < 500MB for typical projects
- Watch mode rebuild: < 100ms for single file change
