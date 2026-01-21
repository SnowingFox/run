# HTTP Server and Client Specification

## Overview

The HTTP module provides high-performance HTTP/1.1, HTTP/2, and WebSocket server and client implementations, along with the fetch API. This is a core component for Bun.serve() and web APIs.

## Bun Reference

- HTTP server: `bun-main/src/bun.js/api/server.zig`
- HTTP client: `bun-main/src/http/AsyncHTTP.zig`
- HTTP Thread: `bun-main/src/http/HTTPThread.zig`
- HTTP Context: `bun-main/src/http/HTTPContext.zig`
- WebSocket client: `bun-main/src/http/websocket_client/`
- WebSocket: `bun-main/src/http/websocket.zig`
- Fetch implementation: `bun-main/src/bun.js/webcore/fetch.zig`
- Headers: `bun-main/src/http/Headers.zig`
- Decompressor: `bun-main/src/http/Decompressor.zig`
- MimeType: `bun-main/src/http/MimeType.zig`

## Public API

### HTTP Server (Bun.serve)

```rust
pub struct Server {
    config: ServerConfig,
    handler: Arc<dyn Handler>,
}

pub struct ServerConfig {
    pub port: u16,
    pub hostname: String,
    pub tls: Option<TlsConfig>,
    pub websocket: Option<WebSocketConfig>,
    pub max_request_body_size: usize,
    pub idle_timeout: Duration,
    pub development: bool,
}

pub struct TlsConfig {
    pub cert: Vec<u8>,
    pub key: Vec<u8>,
    pub ca: Option<Vec<u8>>,
    pub passphrase: Option<String>,
}

#[async_trait]
pub trait Handler: Send + Sync {
    async fn fetch(&self, request: Request) -> Result<Response>;
    async fn error(&self, error: Error) -> Response;
}

impl Server {
    pub fn new(config: ServerConfig, handler: impl Handler + 'static) -> Self;
    pub async fn listen(&self) -> Result<()>;
    pub fn stop(&self, close_connections: bool);
    pub fn reload(&self);
    pub fn port(&self) -> u16;
    pub fn hostname(&self) -> &str;
}
```

### Request/Response

```rust
pub struct Request {
    pub method: Method,
    pub url: Url,
    pub headers: Headers,
    pub body: Option<Body>,
}

impl Request {
    pub fn method(&self) -> Method;
    pub fn url(&self) -> &Url;
    pub fn headers(&self) -> &Headers;
    pub async fn text(&self) -> Result<String>;
    pub async fn json<T: DeserializeOwned>(&self) -> Result<T>;
    pub async fn form_data(&self) -> Result<FormData>;
    pub async fn blob(&self) -> Result<Blob>;
    pub async fn array_buffer(&self) -> Result<Vec<u8>>;
}

pub struct Response {
    pub status: StatusCode,
    pub headers: Headers,
    pub body: Body,
}

impl Response {
    pub fn new(body: impl Into<Body>) -> Self;
    pub fn json<T: Serialize>(data: &T) -> Result<Self>;
    pub fn text(text: impl Into<String>) -> Self;
    pub fn html(html: impl Into<String>) -> Self;
    pub fn redirect(url: &str, status: Option<u16>) -> Self;
    pub fn error() -> Self;
}

pub enum Body {
    Empty,
    Bytes(Vec<u8>),
    Stream(Box<dyn AsyncRead + Send + Unpin>),
}
```

### WebSocket Server

```rust
pub struct WebSocketHandler {
    pub message: Option<Box<dyn Fn(&ServerWebSocket, Message) + Send + Sync>>,
    pub open: Option<Box<dyn Fn(&ServerWebSocket) + Send + Sync>>,
    pub close: Option<Box<dyn Fn(&ServerWebSocket, u16, &str) + Send + Sync>>,
    pub ping: Option<Box<dyn Fn(&ServerWebSocket, &[u8]) + Send + Sync>>,
    pub pong: Option<Box<dyn Fn(&ServerWebSocket, &[u8]) + Send + Sync>>,
    pub drain: Option<Box<dyn Fn(&ServerWebSocket) + Send + Sync>>,
}

pub struct ServerWebSocket {
    // Internal state
}

impl ServerWebSocket {
    pub fn send(&self, data: impl Into<Message>) -> Result<usize>;
    pub fn send_text(&self, text: &str) -> Result<usize>;
    pub fn send_binary(&self, data: &[u8]) -> Result<usize>;
    pub fn close(&self, code: Option<u16>, reason: Option<&str>);
    pub fn subscribe(&self, topic: &str);
    pub fn unsubscribe(&self, topic: &str);
    pub fn publish(&self, topic: &str, data: impl Into<Message>);
    pub fn is_subscribed(&self, topic: &str) -> bool;
    pub fn cork(&self, callback: impl FnOnce(&Self));
}
```

### HTTP Client (fetch)

Based on `AsyncHTTP.zig`:

```rust
/// Async HTTP request/response handler
pub struct AsyncHttp {
    pub request: Option<PicoHttpRequest>,
    pub response: Option<PicoHttpResponse>,
    pub request_headers: HeaderList,
    pub response_headers: HeaderList,
    pub response_buffer: MutableString,
    pub request_body: HttpRequestBody,
    pub method: Method,
    pub url: Url,
    pub http_proxy: Option<Url>,
    pub redirected: bool,
    pub response_encoding: Encoding,
    pub verbose: HttpVerboseLevel,
    pub state: AtomicState,
    pub elapsed: u64,
    pub signals: Signals,
}

pub enum State {
    Pending = 0,
    Scheduled = 1,
    Sending = 2,
    Success = 3,
    Fail = 4,
}

/// Global request limiting
pub static ACTIVE_REQUESTS_COUNT: AtomicUsize;
pub static MAX_SIMULTANEOUS_REQUESTS: AtomicUsize;  // default 256

pub async fn fetch(input: impl Into<FetchInput>, init: Option<RequestInit>) -> Result<Response>;

pub enum FetchInput {
    Url(String),
    Request(Request),
}

pub struct RequestInit {
    pub method: Option<Method>,
    pub headers: Option<Headers>,
    pub body: Option<Body>,
    pub redirect: RedirectPolicy,
    pub signal: Option<AbortSignal>,
    pub timeout: Option<Duration>,
    pub tls: Option<TlsOptions>,
    pub proxy: Option<ProxyConfig>,
    pub unix_socket_path: Option<PathBuf>,
    pub disable_keepalive: bool,
    pub disable_decompression: bool,
    pub reject_unauthorized: bool,
}

pub enum RedirectPolicy {
    Follow,
    Manual,
    Error,
}

/// Options for HTTP client configuration
pub struct ClientOptions {
    pub http_proxy: Option<Url>,
    pub proxy_headers: Option<Headers>,
    pub hostname: Option<String>,
    pub signals: Option<Signals>,
    pub unix_socket_path: Option<PathBuf>,
    pub disable_timeout: bool,
    pub verbose: HttpVerboseLevel,
    pub disable_keepalive: bool,
    pub disable_decompression: bool,
    pub reject_unauthorized: bool,
    pub tls_props: Option<SslConfig>,
}

/// Preconnect to a URL (warm up connection pool)
pub fn preconnect(url: Url, is_url_owned: bool);
```

### Headers

```rust
pub struct Headers {
    inner: Vec<(String, String)>,
}

impl Headers {
    pub fn new() -> Self;
    pub fn from_iter(iter: impl IntoIterator<Item = (String, String)>) -> Self;
    pub fn get(&self, name: &str) -> Option<&str>;
    pub fn get_all(&self, name: &str) -> Vec<&str>;
    pub fn set(&mut self, name: impl Into<String>, value: impl Into<String>);
    pub fn append(&mut self, name: impl Into<String>, value: impl Into<String>);
    pub fn delete(&mut self, name: &str);
    pub fn has(&self, name: &str) -> bool;
    pub fn entries(&self) -> impl Iterator<Item = (&str, &str)>;
}
```

## Behavior Specifications

### Server Behavior

1. **Startup**: Bind to port, accept connections
2. **Request Handling**: Parse HTTP, call handler, send response
3. **Keep-Alive**: Reuse connections for multiple requests
4. **Streaming**: Support streaming request/response bodies
5. **WebSocket Upgrade**: Handle upgrade requests

### Connection Handling

- Connection pooling for keep-alive
- Graceful shutdown with drain period
- Request timeout handling
- Max concurrent connections limit

### TLS

- TLS 1.2 and 1.3 support
- SNI (Server Name Indication)
- Client certificate validation (optional)
- Auto-reload of certificates

### Compression

- gzip compression for responses
- brotli compression
- Accept-Encoding negotiation
- Decompression for client responses

## Edge Cases

### Large Bodies

- Streaming for large request bodies
- Memory limits for buffered bodies
- Chunked transfer encoding

### Error Handling

- Connection reset handling
- Timeout handling
- Malformed request handling
- TLS errors

### WebSocket Edge Cases

- Fragmented messages
- Per-message deflate compression
- Ping/pong handling
- Clean close handshake

## Test Requirements

### Unit Tests

- [ ] Header parsing
- [ ] URL parsing
- [ ] Request/Response construction
- [ ] Body type conversions

### Integration Tests

- [ ] Basic HTTP server
- [ ] HTTPS server
- [ ] WebSocket echo server
- [ ] Fetch client
- [ ] Large file transfer
- [ ] Concurrent connections

### Performance Tests

- [ ] Requests per second benchmark
- [ ] Latency benchmarks
- [ ] Memory usage under load
