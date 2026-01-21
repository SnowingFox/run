# HTTP Server and Client Tasks

## Prerequisites

- `bun-core` (error types, async runtime)
- `bun-web` (for Body, Blob, FormData types)

## Implementation Tasks

### Phase 1: Core Types

- [ ] **TASK-HTTP-001**: Create crate structure
- [ ] **TASK-HTTP-002**: Define Method enum
- [ ] **TASK-HTTP-003**: Implement Headers type
- [ ] **TASK-HTTP-004**: Implement URL parsing
- [ ] **TASK-HTTP-005**: Define Body enum

### Phase 2: Request/Response

- [ ] **TASK-HTTP-006**: Implement Request type
- [ ] **TASK-HTTP-007**: Implement Response type
- [ ] **TASK-HTTP-008**: Implement body parsing (text, json, form)
- [ ] **TASK-HTTP-009**: Implement response builders
- [ ] **TASK-HTTP-010**: Implement streaming body

### Phase 3: HTTP Server Core

- [ ] **TASK-HTTP-011**: Set up async TCP listener
- [ ] **TASK-HTTP-012**: Implement HTTP/1.1 parsing
- [ ] **TASK-HTTP-013**: Implement request routing
- [ ] **TASK-HTTP-014**: Implement response writing
- [ ] **TASK-HTTP-015**: Implement keep-alive

### Phase 4: TLS Support

- [ ] **TASK-HTTP-016**: Integrate rustls
- [ ] **TASK-HTTP-017**: Certificate loading
- [ ] **TASK-HTTP-018**: SNI support
- [ ] **TASK-HTTP-019**: Client certificate validation
- [ ] **TASK-HTTP-020**: Certificate reloading

### Phase 5: HTTP/2

- [ ] **TASK-HTTP-021**: Integrate h2 crate
- [ ] **TASK-HTTP-022**: Stream multiplexing
- [ ] **TASK-HTTP-023**: Server push
- [ ] **TASK-HTTP-024**: ALPN negotiation

### Phase 6: WebSocket Server

- [ ] **TASK-HTTP-025**: WebSocket handshake
- [ ] **TASK-HTTP-026**: Message framing
- [ ] **TASK-HTTP-027**: Text/binary messages
- [ ] **TASK-HTTP-028**: Ping/pong
- [ ] **TASK-HTTP-029**: Close handshake
- [ ] **TASK-HTTP-030**: Pub/sub (topics)
- [ ] **TASK-HTTP-031**: Per-message deflate

### Phase 7: HTTP Client

- [ ] **TASK-HTTP-032**: Basic fetch implementation
- [ ] **TASK-HTTP-033**: Connection pooling
- [ ] **TASK-HTTP-034**: Redirect following
- [ ] **TASK-HTTP-035**: Timeout handling
- [ ] **TASK-HTTP-036**: Proxy support
- [ ] **TASK-HTTP-037**: Abort signal support

### Phase 8: Compression

- [ ] **TASK-HTTP-038**: gzip compression
- [ ] **TASK-HTTP-039**: brotli compression
- [ ] **TASK-HTTP-040**: Decompression
- [ ] **TASK-HTTP-041**: Accept-Encoding negotiation

### Phase 9: Advanced Features

- [ ] **TASK-HTTP-042**: File serving (static files)
- [ ] **TASK-HTTP-043**: ETag generation
- [ ] **TASK-HTTP-044**: Range requests
- [ ] **TASK-HTTP-045**: Hot reload support
- [ ] **TASK-HTTP-046**: Cluster mode

## Test Tasks

- [ ] **TEST-HTTP-001**: Unit tests for headers
- [ ] **TEST-HTTP-002**: Unit tests for URL
- [ ] **TEST-HTTP-003**: Server integration tests
- [ ] **TEST-HTTP-004**: Client integration tests
- [ ] **TEST-HTTP-005**: WebSocket tests
- [ ] **TEST-HTTP-006**: TLS tests
- [ ] **TEST-HTTP-007**: Performance benchmarks

## Integration Tasks

- [ ] **INT-HTTP-001**: Expose as Bun.serve() via JSC
- [ ] **INT-HTTP-002**: Expose fetch() globally
- [ ] **INT-HTTP-003**: Integrate with Node http module
