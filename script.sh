cargo build --release --target wasm32-unknown-unknown --package green_gauge_backend

candid-extractor target/wasm32-unknown-unknown/release/green_gauge_backend.wasm >src/green_gauge_backend/green_gauge_backend.did