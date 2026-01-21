# SQL Clients Specification

## Overview

The SQL module provides native database clients for PostgreSQL, MySQL, and SQLite with support for prepared statements, connection pooling, and transactions.

## Bun Reference

- PostgreSQL: `bun-main/src/sql/postgres/`
  - Connection: `PostgresSQLConnection.zig`
  - Context: `PostgresSQLContext.zig`
  - Query: `PostgresSQLQuery.zig`
  - Statement: `PostgresSQLStatement.zig`
  - Protocol: `PostgresProtocol.zig`
  - Types: `PostgresTypes.zig`
  - SASL: `SASL.zig`
- MySQL: `bun-main/src/sql/mysql/`
  - Connection: `MySQLConnection.zig`
  - Context: `MySQLContext.zig`
  - Query: `MySQLQuery.zig`
  - Statement: `MySQLStatement.zig`
  - Protocol: `protocol/`
  - Types: `MySQLTypes.zig`
  - Auth: `AuthMethod.zig`
- Shared: `bun-main/src/sql/shared/`
  - Data types: `Data.zig`, `SQLDataCell.zig`
  - Column identifiers: `ColumnIdentifier.zig`
  - Query binding: `QueryBindingIterator.zig`
- SQLite: `bun-main/src/bun.js/bindings/sqlite/`

## Public API

### PostgreSQL (Bun.sql)

Based on `postgres.zig` and related files:

```rust
/// JS bindings for PostgreSQL
pub fn create_binding(global: &JSGlobalObject) -> JSValue {
    // Creates: PostgresSQLConnection, init, createQuery, createConnection
}

/// PostgreSQL connection
pub struct PostgresSQLConnection {
    context: PostgresSQLContext,
    protocol: PostgresProtocol,
    auth_state: AuthenticationState,
    tls_status: TlsStatus,
    ssl_mode: SslMode,
    status: Status,
}

/// Authentication states
pub enum AuthenticationState {
    None,
    Requested,
    SaslInitial,
    SaslContinue,
    SaslFinal,
    Authenticated,
}

pub enum Status {
    Disconnected,
    Connecting,
    Connected,
    Ready,
    InTransaction,
    Error,
}

/// Query execution
pub struct PostgresSQLQuery {
    connection: PostgresSQLConnection,
    statement: Option<PostgresSQLStatement>,
}

/// Prepared statement
pub struct PostgresSQLStatement {
    name: String,
    sql: String,
    param_types: Vec<Oid>,
}

/// PostgreSQL types mapping
pub struct PostgresTypes {
    // Maps PostgreSQL OID to Rust/JS types
}

/// SASL authentication (SCRAM-SHA-256)
pub struct SaslAuth {
    // SCRAM-SHA-256 authentication flow
}

impl PostgresClient {
    pub async fn connect(url: &str) -> Result<Self>;
    pub async fn query<T: FromRow>(&self, sql: &str, params: &[Value]) -> Result<Vec<T>>;
    pub async fn execute(&self, sql: &str, params: &[Value]) -> Result<u64>;
    pub async fn transaction<F, T>(&self, f: F) -> Result<T>
        where F: FnOnce(&Transaction) -> Future<Output = Result<T>>;
    pub fn prepare(&self, sql: &str) -> PreparedStatement;
}
```

### MySQL

Based on `mysql.zig` and related files:

```rust
/// MySQL connection
pub struct MySQLConnection {
    context: MySQLContext,
    state: ConnectionState,
    capabilities: Capabilities,
    auth_method: AuthMethod,
    tls_status: TlsStatus,
    ssl_mode: SslMode,
    status_flags: StatusFlags,
}

/// Connection state machine
pub enum ConnectionState {
    Disconnected,
    Connecting,
    Handshake,
    Authenticating,
    Ready,
    InQuery,
    Error,
}

/// Server capabilities (protocol negotiation)
pub struct Capabilities {
    pub long_password: bool,
    pub found_rows: bool,
    pub long_flag: bool,
    pub connect_with_db: bool,
    pub no_schema: bool,
    pub compress: bool,
    pub odbc: bool,
    pub local_files: bool,
    pub ignore_space: bool,
    pub protocol_41: bool,
    pub interactive: bool,
    pub ssl: bool,
    pub transactions: bool,
    pub secure_connection: bool,
    pub multi_statements: bool,
    pub multi_results: bool,
    pub ps_multi_results: bool,
    pub plugin_auth: bool,
    pub connect_attrs: bool,
    pub plugin_auth_lenenc_client_data: bool,
    pub client_session_track: bool,
    pub deprecate_eof: bool,
}

/// Authentication methods
pub enum AuthMethod {
    NativePassword,
    CachingSha2Password,
    Sha256Password,
    OldPassword,
}

/// MySQL types mapping
pub struct MySQLTypes {
    // Maps MySQL type codes to Rust/JS types
}

/// Query status
pub struct QueryStatus {
    pub affected_rows: u64,
    pub last_insert_id: u64,
    pub warnings: u16,
    pub info: Option<String>,
}

impl MySqlClient {
    pub async fn connect(url: &str) -> Result<Self>;
    pub async fn query<T: FromRow>(&self, sql: &str, params: &[Value]) -> Result<Vec<T>>;
    pub async fn execute(&self, sql: &str, params: &[Value]) -> Result<u64>;
}
```

### SQLite (bun:sqlite)

```rust
pub struct Database {
    conn: rusqlite::Connection,
}

impl Database {
    pub fn open(path: &str) -> Result<Self>;
    pub fn open_in_memory() -> Result<Self>;
    pub fn prepare(&self, sql: &str) -> Result<Statement>;
    pub fn exec(&self, sql: &str) -> Result<()>;
    pub fn query<T: FromRow>(&self, sql: &str, params: &[Value]) -> Result<Vec<T>>;
    pub fn close(&self);
}

pub struct Statement {
    pub fn run(&self, params: &[Value]) -> Result<RunResult>;
    pub fn get<T: FromRow>(&self, params: &[Value]) -> Result<Option<T>>;
    pub fn all<T: FromRow>(&self, params: &[Value]) -> Result<Vec<T>>;
    pub fn finalize(&self);
}
```

## Features

- Connection pooling with configurable limits
- Prepared statements with parameter binding
- Transaction support with savepoints
- Named parameters (:name, $name)
- Array/JSON type support
- SSL/TLS connections
- Row streaming for large results

## Test Requirements

- [ ] Connection handling
- [ ] Query execution
- [ ] Prepared statements
- [ ] Transactions
- [ ] Type mapping
- [ ] Error handling
