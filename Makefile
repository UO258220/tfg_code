.PHONY: help install build dev lint format test clean setup

help:
	@echo "Available commands:"
	@echo "  make install       Install dependencies"
	@echo "  make build         Build for production"
	@echo "  make dev           Start development server"
	@echo "  make build-rust    Compile Rust to WebAssembly"
	@echo "  make lint          Run ESLint"
	@echo "  make format        Format code with Prettier"
	@echo "  make test          Run Rust tests"
	@echo "  make clean         Clean build artifacts"
	@echo "  make setup         Complete setup (install deps + build)"

install:
	npm install

setup: install
	npm run build:rust

build:
	npm run build

dev:
	npm run dev

build-rust:
	npm run build:rust

lint:
	npm run lint

format:
	npm run format

test:
	cargo test

clean:
	rm -rf dist node_modules target pkg
	cargo clean
