# CSS Parser Tasks

## Prerequisites

- `bun-core` (error types)

## Implementation Tasks

### Phase 1: Tokenizer & Parser

- [ ] **TASK-CSS-001**: Create crate structure
- [ ] **TASK-CSS-002**: Implement CSS tokenizer
- [ ] **TASK-CSS-003**: Parse selectors
- [ ] **TASK-CSS-004**: Parse declarations
- [ ] **TASK-CSS-005**: Parse at-rules (@media, @import, etc.)
- [ ] **TASK-CSS-006**: Parse values

### Phase 2: Selectors

- [ ] **TASK-CSS-007**: Type selectors
- [ ] **TASK-CSS-008**: Class/ID selectors
- [ ] **TASK-CSS-009**: Attribute selectors
- [ ] **TASK-CSS-010**: Pseudo classes
- [ ] **TASK-CSS-011**: Pseudo elements
- [ ] **TASK-CSS-012**: Combinators
- [ ] **TASK-CSS-013**: :has(), :is(), :where(), :not()

### Phase 3: Properties & Values

- [ ] **TASK-CSS-014**: Color values
- [ ] **TASK-CSS-015**: Length/dimension values
- [ ] **TASK-CSS-016**: URL values
- [ ] **TASK-CSS-017**: Function values
- [ ] **TASK-CSS-018**: Shorthand properties
- [ ] **TASK-CSS-019**: Custom properties (--var)
- [ ] **TASK-CSS-020**: calc(), var() functions

### Phase 4: At-Rules

- [ ] **TASK-CSS-021**: @import
- [ ] **TASK-CSS-022**: @media
- [ ] **TASK-CSS-023**: @keyframes
- [ ] **TASK-CSS-024**: @font-face
- [ ] **TASK-CSS-025**: @supports
- [ ] **TASK-CSS-026**: @layer
- [ ] **TASK-CSS-027**: @container

### Phase 5: CSS Modules

- [ ] **TASK-CSS-028**: Class name scoping
- [ ] **TASK-CSS-029**: :global/:local
- [ ] **TASK-CSS-030**: composes
- [ ] **TASK-CSS-031**: @value

### Phase 6: Transforms

- [ ] **TASK-CSS-032**: Vendor prefixing
- [ ] **TASK-CSS-033**: Browser target handling
- [ ] **TASK-CSS-034**: Nesting transformation (for older targets)

### Phase 7: Minification

- [ ] **TASK-CSS-035**: Whitespace removal
- [ ] **TASK-CSS-036**: Shorthand optimization
- [ ] **TASK-CSS-037**: Color minification
- [ ] **TASK-CSS-038**: Selector merging

### Phase 8: Output

- [ ] **TASK-CSS-039**: CSS printer
- [ ] **TASK-CSS-040**: Source map generation

## Test Tasks

- [ ] **TEST-CSS-001**: Parser tests
- [ ] **TEST-CSS-002**: Selector tests
- [ ] **TEST-CSS-003**: CSS Modules tests
- [ ] **TEST-CSS-004**: Minification tests

## Integration Tasks

- [ ] **INT-CSS-001**: Integrate with bundler
- [ ] **INT-CSS-002**: @import resolution
