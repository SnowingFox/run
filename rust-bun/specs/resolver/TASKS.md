# Module Resolver Tasks

## Prerequisites

- `bun-core` (error types, file system abstractions)
- `bun-parser` (for parsing package.json, tsconfig.json as JSON)

## Implementation Tasks

### Phase 1: Core Infrastructure

- [ ] **TASK-RES-001**: Create crate structure
- [ ] **TASK-RES-002**: Define Resolution result types
- [ ] **TASK-RES-003**: Define ResolverOptions
- [ ] **TASK-RES-004**: Implement file system cache
- [ ] **TASK-RES-005**: Implement directory entry cache

### Phase 2: Package.json Parsing

- [ ] **TASK-RES-006**: Parse basic package.json fields
- [ ] **TASK-RES-007**: Parse exports field (string form)
- [ ] **TASK-RES-008**: Parse exports field (object form)
- [ ] **TASK-RES-009**: Parse exports subpath patterns
- [ ] **TASK-RES-010**: Parse imports field (#imports)
- [ ] **TASK-RES-011**: Parse browser field
- [ ] **TASK-RES-012**: Parse sideEffects field
- [ ] **TASK-RES-013**: Implement package.json cache

### Phase 3: TSConfig Parsing

- [ ] **TASK-RES-014**: Parse tsconfig.json
- [ ] **TASK-RES-015**: Handle extends inheritance
- [ ] **TASK-RES-016**: Parse paths mapping
- [ ] **TASK-RES-017**: Parse baseUrl
- [ ] **TASK-RES-018**: Handle rootDirs
- [ ] **TASK-RES-019**: Implement tsconfig cache

### Phase 4: Basic Resolution

- [ ] **TASK-RES-020**: Implement relative path resolution
- [ ] **TASK-RES-021**: Implement absolute path resolution
- [ ] **TASK-RES-022**: Implement extension resolution
- [ ] **TASK-RES-023**: Implement directory index resolution
- [ ] **TASK-RES-024**: Implement built-in module detection

### Phase 5: Package Resolution

- [ ] **TASK-RES-025**: Implement node_modules walking
- [ ] **TASK-RES-026**: Implement main field resolution
- [ ] **TASK-RES-027**: Implement module field resolution
- [ ] **TASK-RES-028**: Implement exports field resolution
- [ ] **TASK-RES-029**: Implement condition matching
- [ ] **TASK-RES-030**: Implement subpath pattern matching

### Phase 6: Advanced Features

- [ ] **TASK-RES-031**: Implement browser field remapping
- [ ] **TASK-RES-032**: Implement tsconfig paths resolution
- [ ] **TASK-RES-033**: Implement self-reference resolution
- [ ] **TASK-RES-034**: Implement #imports resolution
- [ ] **TASK-RES-035**: Implement data URL resolution

### Phase 7: Caching & Performance

- [ ] **TASK-RES-036**: Implement directory info caching
- [ ] **TASK-RES-037**: Implement negative cache (missing files)
- [ ] **TASK-RES-038**: Implement real path cache
- [ ] **TASK-RES-039**: Thread-safe cache implementation

### Phase 8: Special Cases

- [ ] **TASK-RES-040**: Implement symlink handling
- [ ] **TASK-RES-041**: Implement case sensitivity detection
- [ ] **TASK-RES-042**: Implement external package detection
- [ ] **TASK-RES-043**: Implement glob pattern matching for sideEffects

## Test Tasks

- [ ] **TEST-RES-001**: Relative resolution tests
- [ ] **TEST-RES-002**: Package resolution tests
- [ ] **TEST-RES-003**: Exports field tests
- [ ] **TEST-RES-004**: TSConfig paths tests
- [ ] **TEST-RES-005**: Browser field tests
- [ ] **TEST-RES-006**: Cache correctness tests
- [ ] **TEST-RES-007**: Performance benchmarks

## Integration Tasks

- [ ] **INT-RES-001**: Integrate with bundler
- [ ] **INT-RES-002**: Integrate with runtime module loader
- [ ] **INT-RES-003**: Watch mode cache invalidation
