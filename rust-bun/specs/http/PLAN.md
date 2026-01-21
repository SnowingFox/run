# HTTP Server and Client Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
tokio = { version = "1.43", features = ["full"] }
hyper = { version = "1.5", features = ["full"] }
hyper-util = "0.1"
http = "1.2"
http-body-util = "0.1"
tower = "0.5"
tokio-tungstenite = "0.26"
tungstenite = "0.26"
rustls = "0.23"
rustls-pemfile = "2"
tokio-rustls = "0.26"
flate2 = "1.0"
brotli = "7"
bytes = "1.9"
url = "2.5"
mime = "0.3"
```

### Internal Dependencies

- `bun-core`: Error types, async runtime

## Architecture

### Module Structure

```
bun-http/
├── src/
│   ├── lib.rs
│   ├── server/
│   │   ├── mod.rs
│   │   ├── config.rs
│   │   ├── handler.rs
│   │   ├── listener.rs
│   │   └── connection.rs
│   ├── client/
│   │   ├── mod.rs
│   │   ├── fetch.rs
│   │   ├── pool.rs
│   │   └── proxy.rs
│   ├── websocket/
│   │   ├── mod.rs
│   │   ├── server.rs
│   │   ├── client.rs
│   │   ├── message.rs
│   │   └── pubsub.rs
│   ├── tls/
│   │   ├── mod.rs
│   │   ├── config.rs
│   │   └── reload.rs
│   ├── compression/
│   │   ├── mod.rs
│   │   ├── gzip.rs
│   │   └── brotli.rs
│   ├── types/
│   │   ├── mod.rs
│   │   ├── request.rs
│   │   ├── response.rs
│   │   ├── headers.rs
│   │   ├── body.rs
│   │   └── method.rs
│   └── h2/
│       ├── mod.rs
│       └── stream.rs
└── tests/
    ├── server_tests.rs
    ├── client_tests.rs
    └── websocket_tests.rs
```

### Key Design Decisions

#### 1. Hyper-based Architecture

Build on top of hyper for HTTP/1.1 and HTTP/2:

```rust
pub struct BunServer {
    listener: TcpListener,
    tls_acceptor: Option<TlsAcceptor>,
}

impl BunServer {
    pub async fn serve(&self, handler: impl Handler) -> Result<()> {
        loop {
            let (stream, addr) = self.listener.accept().await?;
            let stream = self.maybe_wrap_tls(stream).await?;

            tokio::spawn(async move {
                let service = service_fn(|req| handler.fetch(req));
                hyper::server::conn::http1::Builder::new()
                    .serve_connection(stream, service)
                    .await
            });
        }
    }
}
```

#### 2. WebSocket Pub/Sub

```rust
pub struct PubSub {
    topics: DashMap<String, HashSet<WebSocketId>>,
    sockets: DashMap<WebSocketId, WebSocket>,
}

impl PubSub {
    pub fn subscribe(&self, socket_id: WebSocketId, topic: &str) {
        self.topics
            .entry(topic.to_string())
            .or_insert_with(HashSet::new)
            .insert(socket_id);
    }

    pub fn publish(&self, topic: &str, message: Message) {
        if let Some(subscribers) = self.topics.get(topic) {
            for socket_id in subscribers.iter() {
                if let Some(socket) = self.sockets.get(socket_id) {
                    let _ = socket.send(message.clone());
                }
            }
        }
    }
}
```

#### 3. Connection Pooling for Client

```rust
pub struct ConnectionPool {
    pools: DashMap<PoolKey, Pool<PooledConnection>>,
    config: PoolConfig,
}

#[derive(Hash, Eq, PartialEq)]
struct PoolKey {
    scheme: Scheme,
    host: String,
    port: u16,
}
```

## Implementation Order

### Month 1: Core HTTP

| Week | Tasks                                    |
| ---- | ---------------------------------------- |
| 1    | Types (Request, Response, Headers, Body) |
| 2    | Basic HTTP server with hyper             |
| 3    | Request/response handling, routing       |
| 4    | TLS integration                          |

### Month 2: WebSocket & Client

| Week | Tasks                      |
| ---- | -------------------------- |
| 1    | WebSocket handshake        |
| 2    | WebSocket message handling |
| 3    | Pub/sub system             |
| 4    | HTTP client (fetch)        |

### Month 3: Advanced Features

| Week | Tasks               |
| ---- | ------------------- |
| 1    | HTTP/2 support      |
| 2    | Compression         |
| 3    | Connection pooling  |
| 4    | Static file serving |

## Risk Analysis

### High Risk

| Risk                            | Mitigation                         |
| ------------------------------- | ---------------------------------- |
| Performance vs existing servers | Careful benchmarking, optimization |
| WebSocket edge cases            | Extensive testing                  |

### Medium Risk

| Risk              | Mitigation             |
| ----------------- | ---------------------- |
| TLS compatibility | Use well-tested rustls |
| HTTP/2 complexity | Leverage h2 crate      |

### Low Risk

| Risk                | Mitigation                |
| ------------------- | ------------------------- |
| Basic HTTP handling | Hyper is well-established |

## Performance Targets

Based on Bun's performance:

- 100k+ requests/second for simple response
- < 50μs p99 latency
- WebSocket: 1M+ messages/second broadcast
