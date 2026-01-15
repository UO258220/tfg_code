#!/bin/bash
set -e

echo "Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

echo "Installing wasm-pack..."
curl https://rustwasm.org/wasm-pack/installer/init.sh -sSf | sh

echo "Adding wasm32 target..."
rustup target add wasm32-unknown-unknown

echo "Installing Node dependencies..."
npm install

echo "Building Rust to WebAssembly..."
npm run build:rust

echo "Setup complete! Run 'npm run dev' to start."
