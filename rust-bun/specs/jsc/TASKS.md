# JSC Bindings Tasks

## Prerequisites

- `bun-core` (error types)
- JavaScriptCore framework (system dependency on macOS)

## Implementation Tasks

### Phase 1: Core Bindings

- [ ] **TASK-JSC-001**: Set up crate with rusty_jsc dependency
- [ ] **TASK-JSC-002**: Implement JSContext wrapper
- [ ] **TASK-JSC-003**: Implement JSValue wrapper
- [ ] **TASK-JSC-004**: Implement type checking methods
- [ ] **TASK-JSC-005**: Implement type conversion methods

### Phase 2: Object Handling

- [ ] **TASK-JSC-006**: Implement JSObject wrapper
- [ ] **TASK-JSC-007**: Property get/set
- [ ] **TASK-JSC-008**: Property enumeration
- [ ] **TASK-JSC-009**: Index access for arrays
- [ ] **TASK-JSC-010**: Object creation utilities

### Phase 3: Functions

- [ ] **TASK-JSC-011**: Implement function calls
- [ ] **TASK-JSC-012**: Implement method calls
- [ ] **TASK-JSC-013**: Native function binding
- [ ] **TASK-JSC-014**: Function with captured data
- [ ] **TASK-JSC-015**: Constructor calls

### Phase 4: Classes

- [ ] **TASK-JSC-016**: Implement JSClass
- [ ] **TASK-JSC-017**: Class builder pattern
- [ ] **TASK-JSC-018**: Method binding
- [ ] **TASK-JSC-019**: Property descriptors
- [ ] **TASK-JSC-020**: Static methods

### Phase 5: Promises & Async

- [ ] **TASK-JSC-021**: Implement JSPromise
- [ ] **TASK-JSC-022**: Resolver/Rejecter implementation
- [ ] **TASK-JSC-023**: Promise.all/race bindings
- [ ] **TASK-JSC-024**: Async function support

### Phase 6: Script Evaluation

- [ ] **TASK-JSC-025**: Implement script evaluation
- [ ] **TASK-JSC-026**: Source file association
- [ ] **TASK-JSC-027**: Exception handling
- [ ] **TASK-JSC-028**: Stack trace capture

### Phase 7: Module System

- [ ] **TASK-JSC-029**: Implement ModuleLoader trait
- [ ] **TASK-JSC-030**: Module resolution hook
- [ ] **TASK-JSC-031**: Module evaluation
- [ ] **TASK-JSC-032**: Import meta handling

### Phase 8: Event Loop

- [ ] **TASK-JSC-033**: Integrate with tokio
- [ ] **TASK-JSC-034**: Microtask queue
- [ ] **TASK-JSC-035**: Timer integration
- [ ] **TASK-JSC-036**: nextTick implementation

### Phase 9: Global Objects

- [ ] **TASK-JSC-037**: Set up global object
- [ ] **TASK-JSC-038**: Console implementation
- [ ] **TASK-JSC-039**: Process object
- [ ] **TASK-JSC-040**: Bun global object
- [ ] **TASK-JSC-041**: Buffer/ArrayBuffer

### Phase 10: Memory Management

- [ ] **TASK-JSC-042**: Reference counting
- [ ] **TASK-JSC-043**: GC integration
- [ ] **TASK-JSC-044**: prevent/allow bridging
- [ ] **TASK-JSC-045**: Weak references

## Test Tasks

- [ ] **TEST-JSC-001**: Value conversion tests
- [ ] **TEST-JSC-002**: Object manipulation tests
- [ ] **TEST-JSC-003**: Function call tests
- [ ] **TEST-JSC-004**: Class definition tests
- [ ] **TEST-JSC-005**: Promise tests
- [ ] **TEST-JSC-006**: Module loading tests
- [ ] **TEST-JSC-007**: Memory leak tests

## Integration Tasks

- [ ] **INT-JSC-001**: Expose Bun APIs via JSC
- [ ] **INT-JSC-002**: Integrate with bundler for runtime
- [ ] **INT-JSC-003**: Node.js compatibility layer
