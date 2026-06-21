# Multi-stage Docker image — builds frontend + backend, serves everything.
# Platforms: linux/amd64, linux/arm64
# Usage:
#   docker compose up              # with NATS
#   docker compose -f docker-compose.yml 
ARG BUILDPLATFORM=linux/amd64
ARG TARGETPLATFORM=linux/amd64
ARG GO_VERSION=1.25
ARG NODE_VERSION=20

# ── Stage 1: Frontend ────────────────────────────────────────────────────────
FROM --platform=$BUILDPLATFORM node:${NODE_VERSION}-alpine AS frontend
WORKDIR /app/web
COPY web/package.json web/package-lock.json* ./
RUN npm ci --silent
COPY web/ .
RUN npm run build

# ── Stage 2: Backend ─────────────────────────────────────────────────────────
FROM --platform=$BUILDPLATFORM golang:${GO_VERSION}-alpine AS backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM alpine:3.20
RUN apk --no-cache add \
    ca-certificates \
    tzdata \
    && addgroup -S app -g 1000 \
    && adduser -S app -u 1000 -G app

WORKDIR /app
COPY --from=backend --chown=app:app /out/server ./server
COPY --from=frontend --chown=app:app /app/web/dist ./web/dist

USER app
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

EXPOSE 3000
ENTRYPOINT ["./server"]
CMD ["--port", "3000"]
