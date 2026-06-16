# Contributing to Nebula

Thank you for your interest in contributing to Nebula!

## Project Status

🚧 **We are currently in the Research & Design phase.**

While we're not yet ready for code contributions, we welcome:
- Feedback on the design and architecture
- Ideas for features
- Questions about NATS operations
- Interest in early testing

## How to Contribute (When Development Starts)

### Reporting Issues

When reporting issues, please include:
- NATS server version
- Nebula version (if applicable)
- Steps to reproduce
- Expected vs. actual behavior
- Relevant logs or screenshots

### Suggesting Features

Feature suggestions should include:
- Use case description
- Why the feature matters
- Proposed implementation (if you have ideas)
- Examples from similar tools

### Submitting Pull Requests

When development begins, PRs should:
1. Include tests for new functionality
2. Pass all existing tests
3. Follow Go best practices
4. Update documentation as needed
5. Have a clear description of changes

## Code of Conduct

- Be respectful and constructive
- Assume good intentions
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started (Future)

When development begins:

```bash
# Clone the repository
git clone https://github.com/nebula/nats-monitoring.git

# Navigate to the project
cd nats-monitoring

# Build the project
make build

# Run tests
make test

# Run the application
./bin/nebula
```

## Development Guidelines

### Go Style Guide
- Follow [Effective Go](https://go.dev/doc/effective_go)
- Use `gofmt` for formatting
- Write self-documenting code
- Comment non-obvious behavior

### Testing
- Aim for >70% code coverage
- Write tests alongside code
- Use table-driven tests where appropriate
- Mock external dependencies

### Documentation
- Update README for user-facing changes
- Document exported functions
- Add examples for complex features

## Questions?

Join our discussion at:
- GitHub Discussions: [Link to be added]
- Discord: [Link to be added]
- NATS Slack: #nebula channel (TBD)

---

Thank you for your interest in Nebula!
