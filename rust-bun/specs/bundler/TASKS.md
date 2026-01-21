# Bundler Tasks

## Prerequisites

- `bun-core` (error types, allocators, async runtime)
- `bun-parser` (JavaScript/TypeScript parsing)
- `bun-resolver` (module resolution)
- `bun-css` (CSS parsing and bundling)

## Implementation Tasks

### Phase 1: Core Infrastructure

- [ ] **TASK-BND-001**: Create crate structure
- [ ] **TASK-BND-002**: Define BuildOptions and BuildOutput
- [ ] **TASK-BND-003**: Implement build entry point
- [ ] **TASK-BND-004**: Set up thread pool for parallel processing
- [ ] **TASK-BND-005**: Define module graph data structures

### Phase 2: Module Graph Building

- [ ] **TASK-BND-006**: Implement entry point discovery
- [ ] **TASK-BND-007**: Implement parallel parse task
- [ ] **TASK-BND-008**: Implement import/export extraction
- [ ] **TASK-BND-009**: Build dependency graph
- [ ] **TASK-BND-010**: Handle circular dependencies

### Phase 3: Loaders

- [ ] **TASK-BND-011**: Implement JS/TS loader
- [ ] **TASK-BND-012**: Implement JSX/TSX loader
- [ ] **TASK-BND-013**: Implement JSON loader
- [ ] **TASK-BND-014**: Implement TOML loader
- [ ] **TASK-BND-015**: Implement Text loader
- [ ] **TASK-BND-016**: Implement File/Asset loader
- [ ] **TASK-BND-017**: Implement Base64 loader
- [ ] **TASK-BND-018**: Implement DataURL loader
- [ ] **TASK-BND-019**: Implement Empty loader

### Phase 4: Linker

- [ ] **TASK-BND-020**: Implement symbol table
- [ ] **TASK-BND-021**: Implement export resolution
- [ ] **TASK-BND-022**: Implement import binding
- [ ] **TASK-BND-023**: Handle re-exports
- [ ] **TASK-BND-024**: Handle namespace imports
- [ ] **TASK-BND-025**: CommonJS/ESM interop

### Phase 5: Tree Shaking

- [ ] **TASK-BND-026**: Implement used symbol marking
- [ ] **TASK-BND-027**: Handle side effects detection
- [ ] **TASK-BND-028**: Implement dead code elimination
- [ ] **TASK-BND-029**: Handle package.json sideEffects
- [ ] **TASK-BND-030**: Preserve necessary side effects

### Phase 6: Code Splitting

- [ ] **TASK-BND-031**: Detect dynamic import boundaries
- [ ] **TASK-BND-032**: Compute chunk graph
- [ ] **TASK-BND-033**: Extract shared dependencies
- [ ] **TASK-BND-034**: Generate chunk loading code
- [ ] **TASK-BND-035**: Handle import() with variables

### Phase 7: Code Generation

- [ ] **TASK-BND-036**: Implement ESM output format
- [ ] **TASK-BND-037**: Implement CJS output format
- [ ] **TASK-BND-038**: Implement IIFE output format
- [ ] **TASK-BND-039**: Generate runtime helpers
- [ ] **TASK-BND-040**: Handle banner/footer

### Phase 8: Minification

- [ ] **TASK-BND-041**: Whitespace removal
- [ ] **TASK-BND-042**: Identifier mangling
- [ ] **TASK-BND-043**: Dead code elimination
- [ ] **TASK-BND-044**: Constant folding
- [ ] **TASK-BND-045**: Property mangling (optional)

### Phase 9: Source Maps

- [ ] **TASK-BND-046**: Track source locations through transforms
- [ ] **TASK-BND-047**: Generate source map JSON
- [ ] **TASK-BND-048**: Handle source map linking
- [ ] **TASK-BND-049**: Inline source maps
- [ ] **TASK-BND-050**: Source map for minified code

### Phase 10: Plugin System

- [ ] **TASK-BND-051**: Define Plugin trait
- [ ] **TASK-BND-052**: Implement onResolve hooks
- [ ] **TASK-BND-053**: Implement onLoad hooks
- [ ] **TASK-BND-054**: Plugin ordering and chaining
- [ ] **TASK-BND-055**: Error handling in plugins

### Phase 11: CSS Integration

- [ ] **TASK-BND-056**: Integrate bun-css for CSS parsing
- [ ] **TASK-BND-057**: Handle CSS @import
- [ ] **TASK-BND-058**: CSS Modules transformation
- [ ] **TASK-BND-059**: CSS minification
- [ ] **TASK-BND-060**: CSS source maps

### Phase 12: HTML Entry Points

- [ ] **TASK-BND-061**: Parse HTML entry points
- [ ] **TASK-BND-062**: Extract script/link references
- [ ] **TASK-BND-063**: Bundle referenced assets
- [ ] **TASK-BND-064**: Update paths in output HTML
- [ ] **TASK-BND-065**: Inject runtime scripts

### Phase 13: Watch Mode

- [ ] **TASK-BND-066**: File system watching
- [ ] **TASK-BND-067**: Incremental rebuilds
- [ ] **TASK-BND-068**: Cache invalidation
- [ ] **TASK-BND-069**: Error overlay generation

## Test Tasks

- [ ] **TEST-BND-001**: Unit tests for graph building
- [ ] **TEST-BND-002**: Unit tests for tree shaking
- [ ] **TEST-BND-003**: Unit tests for code splitting
- [ ] **TEST-BND-004**: Integration tests with real projects
- [ ] **TEST-BND-005**: Source map accuracy tests
- [ ] **TEST-BND-006**: Performance benchmarks
- [ ] **TEST-BND-007**: Plugin system tests

## Integration Tasks

- [ ] **INT-BND-001**: Expose Bun.build() API via JSC
- [ ] **INT-BND-002**: CLI integration (bun build command)
- [ ] **INT-BND-003**: Dev server integration
