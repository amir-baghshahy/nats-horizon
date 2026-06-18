# Contributing to nats-monitor

Thank you for your interest in contributing!

## Getting Started

```bash
# Clone the repository
git clone https://github.com/amir/nats-monitor.git
cd nats-monitor

# Install all dependencies (Go + Node)
make install

# Copy env and start a local NATS server (requires Docker)
cp .env.example .env
docker run -d --name nats -p 4222:4222 nats:latest -js

# Start both backend and frontend in dev mode
make dev
```

The backend runs at `http://localhost:3000` and the frontend at `http://localhost:5173`.

## Running Tests

```bash
make test        # Go tests
make fmt         # Format Go code
cd web && npm run lint  # Frontend lint (zero warnings policy)
```

## Reporting Issues

Please include:
- NATS server version (`nats-server -v`)
- Steps to reproduce
- Expected vs. actual behavior
- Relevant logs or screenshots

## Submitting Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes with tests where applicable
3. Ensure `make test` and `npm run lint` pass
4. Open a PR with a clear description

## Code Style

- **Go:** follow [Effective Go](https://go.dev/doc/effective_go); use `gofmt`
- **TypeScript:** ESLint config is enforced (zero warnings)
- No comments that describe *what* the code does — only *why* when non-obvious

## Architecture

See [CLAUDE.md](./CLAUDE.md) for a full description of the backend and frontend architecture.

## Questions?

Open a [GitHub Discussion](https://github.com/amir/nats-monitor/discussions) or file an issue.
