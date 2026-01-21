# S3 and Redis Clients Specification

## Overview

Native S3 and Redis (Valkey) client implementations for high-performance object storage and caching.

## Bun Reference

- S3: `bun-main/src/s3/`
- Redis/Valkey: `bun-main/src/valkey/`

## S3 API

Based on `s3/client.zig`:

```rust
/// S3 credentials and configuration
pub struct S3Credentials {
    pub access_key_id: String,
    pub secret_access_key: String,
    pub session_token: Option<String>,
    pub bucket: String,
    pub region: String,
    pub endpoint: Option<String>,
}

pub struct S3CredentialsWithOptions {
    pub credentials: S3Credentials,
    pub options: S3Options,
}

/// ACL for S3 objects
pub enum Acl {
    Private,
    PublicRead,
    PublicReadWrite,
    AuthenticatedRead,
    AwsExecRead,
    BucketOwnerRead,
    BucketOwnerFullControl,
}

/// Storage class for S3 objects
pub enum StorageClass {
    Standard,
    ReducedRedundancy,
    StandardIa,
    OnezoneIa,
    IntelligentTiering,
    Glacier,
    DeepArchive,
    GlacierIr,
    Express,
}

/// Result types for S3 operations
pub struct S3StatResult {
    pub size: usize,
    pub etag: String,
    pub last_modified: DateTime,
    pub content_type: Option<String>,
}

pub struct S3DownloadResult {
    pub body: Vec<u8>,
    pub metadata: S3StatResult,
}

pub struct S3UploadResult {
    pub etag: String,
}

pub struct S3DeleteResult {
    pub success: bool,
}

pub struct S3ListObjectsResult {
    pub contents: Vec<S3ObjectInfo>,
    pub is_truncated: bool,
    pub continuation_token: Option<String>,
}

pub struct S3ListObjectsOptions {
    pub prefix: Option<String>,
    pub delimiter: Option<String>,
    pub max_keys: Option<u32>,
    pub continuation_token: Option<String>,
    pub encoding_type: Option<String>,
    pub fetch_owner: Option<bool>,
}

/// Main S3 client functions
impl S3Credentials {
    /// HEAD request - get object metadata
    pub async fn stat(
        &self,
        path: &str,
        callback: StatCallback,
        proxy_url: Option<&str>,
        request_payer: bool,
    ) -> Result<()>;

    /// GET request - download object
    pub async fn download(
        &self,
        path: &str,
        callback: DownloadCallback,
        proxy_url: Option<&str>,
        request_payer: bool,
    ) -> Result<()>;

    /// GET with Range header - download slice
    pub async fn download_slice(
        &self,
        path: &str,
        offset: usize,
        size: Option<usize>,
        callback: DownloadCallback,
        proxy_url: Option<&str>,
        request_payer: bool,
    ) -> Result<()>;

    /// DELETE request
    pub async fn delete(
        &self,
        path: &str,
        callback: DeleteCallback,
        proxy_url: Option<&str>,
        request_payer: bool,
    ) -> Result<()>;

    /// List objects in bucket
    pub async fn list_objects(
        &self,
        options: S3ListObjectsOptions,
        callback: ListCallback,
        proxy_url: Option<&str>,
    ) -> Result<()>;
}

/// Multipart upload support
pub struct MultiPartUpload {
    pub credentials: S3Credentials,
    pub key: String,
    pub upload_id: String,
}

pub struct MultiPartUploadOptions {
    pub acl: Option<Acl>,
    pub storage_class: Option<StorageClass>,
    pub content_type: Option<String>,
    pub part_size: usize,
}

/// Streaming download
pub struct S3HttpDownloadStreamingTask {
    // Stream response body chunks
}

/// File-like API (Bun.s3)
pub struct S3File {
    client: S3Credentials,
    key: String,
}

impl S3File {
    pub async fn text(&self) -> Result<String>;
    pub async fn json<T: DeserializeOwned>(&self) -> Result<T>;
    pub async fn array_buffer(&self) -> Result<Vec<u8>>;
    pub fn stream(&self) -> ReadableStream;
    pub async fn write(&self, data: &[u8]) -> Result<()>;
    pub async fn exists(&self) -> bool;
    pub async fn delete(&self) -> Result<()>;
}
```

## Redis/Valkey API

Based on `valkey.zig`:

```rust
/// Connection status for Valkey client
pub enum Status {
    Disconnected,
    Connecting,
    Connected,
}

/// Connection flags to track client state
pub struct ConnectionFlags {
    pub is_authenticated: bool,
    pub is_manually_closed: bool,
    pub is_selecting_db_internal: bool,
    pub enable_offline_queue: bool,
    pub needs_to_open_socket: bool,
    pub enable_auto_reconnect: bool,
    pub is_reconnecting: bool,
    pub failed: bool,
    pub enable_auto_pipelining: bool,
    pub finalized: bool,
    /// For promise resolution in connect() vs duplicate()
    pub connection_promise_returns_client: bool,
}

/// Protocol types for Valkey/Redis connections
pub enum Protocol {
    Standalone,
    StandaloneUnix,
    StandaloneTls,
    StandaloneTlsUnix,
}

impl Protocol {
    /// Parse from URL scheme (valkey://, redis://, rediss://, etc.)
    pub fn from_scheme(scheme: &str) -> Option<Protocol>;
    pub fn is_tls(&self) -> bool;
    pub fn is_unix(&self) -> bool;
}

/// TLS configuration
pub enum Tls {
    None,
    Enabled,
    Custom(SslConfig),
}

/// Connection options
pub struct Options {
    pub idle_timeout_ms: u32,          // default 0
    pub connection_timeout_ms: u32,     // default 10000
    pub enable_auto_reconnect: bool,    // default true
    pub max_retries: u32,               // default 20
    pub enable_offline_queue: bool,     // default true
    pub enable_auto_pipelining: bool,   // default true
    pub enable_debug_logging: bool,     // default false
    pub tls: Tls,
}

/// Address for connection
pub enum Address {
    Unix(String),
    Host { host: String, port: u16 },
}

/// Core Valkey client
pub struct ValkeyClient {
    pub socket: AnySocket,
    pub status: Status,
    /// Write buffer for outgoing data
    pub write_buffer: OffsetByteList,
    /// Read buffer for incoming data
    pub read_buffer: OffsetByteList,
    /// In-flight commands (sent to server, awaiting response)
    pub in_flight: CommandQueue,
    /// Commands waiting to be sent
    pub queue: CommandQueue,
    pub password: String,
    pub username: String,
    pub database: u32,
    pub address: Address,
    pub protocol: Protocol,
    pub tls: Tls,
    pub idle_timeout_interval_ms: u32,
    pub connection_timeout_ms: u32,
    pub retry_attempts: u32,
    pub max_retries: u32,
}

impl ValkeyClient {
    pub async fn connect(url: &str) -> Result<Self>;
    pub async fn connect_with_options(url: &str, options: Options) -> Result<Self>;
    pub async fn duplicate(&self) -> Result<Self>;
    pub fn close(&mut self);

    // Commands (all support auto-pipelining)
    pub async fn get(&self, key: &str) -> Result<Option<String>>;
    pub async fn set(&self, key: &str, value: &str, options: SetOptions) -> Result<()>;
    pub async fn incr(&self, key: &str) -> Result<i64>;
    pub async fn decr(&self, key: &str) -> Result<i64>;

    // Keys
    pub async fn del(&self, keys: &[&str]) -> Result<u64>;
    pub async fn exists(&self, keys: &[&str]) -> Result<u64>;
    pub async fn expire(&self, key: &str, seconds: u64) -> Result<bool>;
    pub async fn ttl(&self, key: &str) -> Result<i64>;

    // Lists
    pub async fn lpush(&self, key: &str, values: &[&str]) -> Result<u64>;
    pub async fn rpush(&self, key: &str, values: &[&str]) -> Result<u64>;
    pub async fn lpop(&self, key: &str) -> Result<Option<String>>;
    pub async fn rpop(&self, key: &str) -> Result<Option<String>>;
    pub async fn lrange(&self, key: &str, start: i64, stop: i64) -> Result<Vec<String>>;

    // Hashes
    pub async fn hget(&self, key: &str, field: &str) -> Result<Option<String>>;
    pub async fn hset(&self, key: &str, field: &str, value: &str) -> Result<()>;
    pub async fn hgetall(&self, key: &str) -> Result<HashMap<String, String>>;

    // Sets
    pub async fn sadd(&self, key: &str, members: &[&str]) -> Result<u64>;
    pub async fn smembers(&self, key: &str) -> Result<HashSet<String>>;

    // Pub/Sub
    pub async fn publish(&self, channel: &str, message: &str) -> Result<u64>;
    pub async fn subscribe(&self, channels: &[&str]) -> Subscription;

    // Transactions
    pub async fn multi(&self) -> Transaction;

    // Raw command
    pub async fn command(&self, cmd: &str, args: &[&str]) -> Result<Value>;
}

pub struct SetOptions {
    pub ex: Option<u64>,      // Seconds TTL
    pub px: Option<u64>,      // Milliseconds TTL
    pub nx: bool,             // Only set if not exists
    pub xx: bool,             // Only set if exists
}
```

## Features

### S3

- AWS S3 compatible
- Cloudflare R2, MinIO support
- Streaming uploads/downloads
- Multipart uploads
- Pre-signed URLs
- File-like API (Bun.s3)

### Redis

- Full Redis command set
- Connection pooling
- Pub/Sub support
- Transactions (MULTI/EXEC)
- Cluster support
- TLS connections

## Test Requirements

- [ ] S3 CRUD operations
- [ ] S3 multipart upload
- [ ] Redis all data types
- [ ] Redis pub/sub
- [ ] Connection pooling
- [ ] Error handling
