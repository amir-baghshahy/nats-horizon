# nats-ui

A modern, web-based monitoring and administration platform for NATS and JetStream.

## Features

- 🎨 Beautiful, modern web UI inspired by Grafana and Redpanda Console
- 📊 Real-time monitoring with WebSocket updates
- 🔒 Security and compliance dashboard
- 📝 Audit log exploration
- 👥 User and connection monitoring
- 🛠️ Stream and consumer management

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- NATS server with JetStream enabled

### Running the Backend

```bash
# Install dependencies
go mod download

# Run the server
go run cmd/server/main.go
```

The API server will start on `http://localhost:3000`

### Running the Frontend (Development)

```bash
cd web

# Install dependencies
npm install

# Run dev server
npm run dev
```

The frontend will start on `http://localhost:5173` and proxy API calls to the backend.

### Production Build

```bash
# Build the frontend
cd web
npm run build

# Run the server (serves built frontend)
cd ..
go run cmd/server/main.go
```

Then open `http://localhost:3000` in your browser.

## Project Structure

```
nats-monitoring/
├── cmd/server/          # Go backend entry point
├── internal/
│   ├── handlers/       # REST handlers (gin)
│   ├── usecase/        # Business logic
│   ├── infrastructure/ # NATS repository implementations
│   ├── domain/         # Entities and repository interfaces
│   ├── nats/           # NATS service wrappers
│   └── config/         # Configuration loading
├── web/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
└── go.mod
```

## Configuration

By default, connects to `nats://localhost:4222`. To configure:

```bash
# Set NATS_URL environment variable
export NATS_URL=nats://your-server:4222

# Or pass as command line argument (coming soon)
```

## Roadmap

- [x] Basic dashboard
- [x] Streams view
- [x] Consumers view
- [x] Security dashboard
- [ ] Real-time WebSocket updates
- [ ] Stream/consumer creation UI
- [ ] Message inspection
- [ ] Topology visualization
- [ ] Audit log export
- [ ] Compliance reports
- [ ] Multi-server support

## License

MIT

## Inspired By

- [Grafana](https://grafana.com/)
- [Redpanda Console](https://github.com/redpanda-data/console)
- [AKHQ](https://akhq.io/)
