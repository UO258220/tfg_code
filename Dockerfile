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

RUN cargo build --release --bin validate_rdf_shacl

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/target/release/validate_rdf_shacl ./target/release/validate_rdf_shacl

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server.js"]
