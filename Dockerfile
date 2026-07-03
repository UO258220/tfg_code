FROM node:20-bookworm AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        curl \
        libssl-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY Cargo.toml Cargo.lock ./
COPY patches ./patches
COPY src ./src
COPY server.js ./

# Use a debug build to avoid the LTO linker OOM on Render's free tier (512 MB).
# The [profile.release] lto=true / opt-level="z" settings are for the WASM bundle
# only; the native validation binary doesn't need them.
ENV CARGO_BUILD_JOBS=2
RUN cargo build --bin validate_rdf_shacl

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/target/debug/validate_rdf_shacl ./target/debug/validate_rdf_shacl

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server.js"]
