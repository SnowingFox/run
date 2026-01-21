# Package Manager Tasks

## Prerequisites

- `bun-core` (error types, HTTP client base)
- `bun-http` (for registry communication)

## Implementation Tasks

### Phase 1: Core Infrastructure

- [ ] **TASK-PKG-001**: Create crate structure
- [ ] **TASK-PKG-002**: Implement semver version parsing
- [ ] **TASK-PKG-003**: Implement semver range matching
- [ ] **TASK-PKG-004**: Implement package.json parsing
- [ ] **TASK-PKG-005**: Implement package.json writing

### Phase 2: Lockfile

- [ ] **TASK-PKG-006**: Define lockfile format (bun.lockb compatible)
- [ ] **TASK-PKG-007**: Implement binary lockfile parsing
- [ ] **TASK-PKG-008**: Implement lockfile writing
- [ ] **TASK-PKG-009**: Implement text lockfile format (bun.lock)
- [ ] **TASK-PKG-010**: Implement lockfile diffing

### Phase 3: Registry Client

- [ ] **TASK-PKG-011**: Implement NPM registry client
- [ ] **TASK-PKG-012**: Implement package manifest fetching
- [ ] **TASK-PKG-013**: Implement tarball downloading
- [ ] **TASK-PKG-014**: Implement registry authentication
- [ ] **TASK-PKG-015**: Implement scoped registry support
- [ ] **TASK-PKG-016**: Implement .npmrc parsing

### Phase 4: Dependency Resolution

- [ ] **TASK-PKG-017**: Implement dependency tree builder
- [ ] **TASK-PKG-018**: Implement version resolution algorithm
- [ ] **TASK-PKG-019**: Handle peer dependencies
- [ ] **TASK-PKG-020**: Handle optional dependencies
- [ ] **TASK-PKG-021**: Handle circular dependencies
- [ ] **TASK-PKG-022**: Implement overrides/resolutions

### Phase 5: Installation

- [ ] **TASK-PKG-023**: Implement parallel tarball extraction
- [ ] **TASK-PKG-024**: Implement node_modules layout
- [ ] **TASK-PKG-025**: Implement package hoisting
- [ ] **TASK-PKG-026**: Implement hard linking from cache
- [ ] **TASK-PKG-027**: Implement binary linking
- [ ] **TASK-PKG-028**: Implement .bin shim creation

### Phase 6: Lifecycle Scripts

- [ ] **TASK-PKG-029**: Implement script runner
- [ ] **TASK-PKG-030**: Implement preinstall/postinstall hooks
- [ ] **TASK-PKG-031**: Implement prepare hook
- [ ] **TASK-PKG-032**: Handle script timeouts
- [ ] **TASK-PKG-033**: Implement parallel script execution

### Phase 7: Workspaces

- [ ] **TASK-PKG-034**: Implement workspace discovery
- [ ] **TASK-PKG-035**: Implement workspace: protocol
- [ ] **TASK-PKG-036**: Implement workspace filtering (--filter)
- [ ] **TASK-PKG-037**: Implement workspace dependency hoisting

### Phase 8: Commands

- [ ] **TASK-PKG-038**: Implement `bun install`
- [ ] **TASK-PKG-039**: Implement `bun add`
- [ ] **TASK-PKG-040**: Implement `bun remove`
- [ ] **TASK-PKG-041**: Implement `bun update`
- [ ] **TASK-PKG-042**: Implement `bun link`
- [ ] **TASK-PKG-043**: Implement `bun unlink`
- [ ] **TASK-PKG-044**: Implement `bun pm` subcommands
- [ ] **TASK-PKG-045**: Implement `bun outdated`
- [ ] **TASK-PKG-046**: Implement `bun audit`

### Phase 9: Global Packages

- [ ] **TASK-PKG-047**: Implement global package installation
- [ ] **TASK-PKG-048**: Implement global bin directory
- [ ] **TASK-PKG-049**: Implement bunx command

### Phase 10: Cache Management

- [ ] **TASK-PKG-050**: Implement content-addressed cache
- [ ] **TASK-PKG-051**: Implement cache cleanup
- [ ] **TASK-PKG-052**: Implement cache verification
- [ ] **TASK-PKG-053**: Implement offline mode

### Phase 11: Publishing

- [ ] **TASK-PKG-054**: Implement `bun publish`
- [ ] **TASK-PKG-055**: Implement tarball creation
- [ ] **TASK-PKG-056**: Implement prepublish/postpublish hooks

## Test Tasks

- [ ] **TEST-PKG-001**: Semver parsing tests
- [ ] **TEST-PKG-002**: Lockfile tests
- [ ] **TEST-PKG-003**: Registry client tests
- [ ] **TEST-PKG-004**: Resolution tests
- [ ] **TEST-PKG-005**: Installation tests
- [ ] **TEST-PKG-006**: Workspace tests
- [ ] **TEST-PKG-007**: Performance benchmarks

## Integration Tasks

- [ ] **INT-PKG-001**: CLI command integration
- [ ] **INT-PKG-002**: bunfig.toml integration
- [ ] **INT-PKG-003**: Environment variable support
