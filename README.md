# Noko Time Tracking for Raycast

[![CI Status](https://img.shields.io/github/actions/workflow/status/JuanVqz/noko-for-raycast/ci.yml?branch=main)](https://github.com/JuanVqz/noko-for-raycast/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/JuanVqz/noko-for-raycast?label=release)](https://github.com/JuanVqz/noko-for-raycast/releases/latest)
[![License](https://img.shields.io/github/license/JuanVqz/noko-for-raycast)](LICENSE)

> [!WARNING]
> This is an unofficial extension and is not affiliated with [Noko Time Tracking](https://nokotime.com).

Manage your Noko time tracking from Raycast: run timers, log entries, and review daily and weekly summaries from a single command.

## Features

- **Timers** - Start, pause, resume, log, reset, or discard a timer per project, with live elapsed time.
- **Time entries** - Create, edit, and delete entries with tags, flexible time input (`1:30` or `90`), and project billing defaults.
- **Summaries** - Daily and weekly billable/unbillable breakdowns, a daily breakdown view, and an optional weekly hour goal with pace indicator.

## Getting Started

1. Install [Raycast](https://raycast.com/) and have a Noko account with API access.
2. Generate a **Personal Access Token** in Noko: **Integration & Apps → Personal Access Tokens**.
3. Open the `Timers` command in Raycast and paste your token when prompted. Timezone is optional (defaults to your system timezone).

## Usage

Open Raycast and run **`Timers`** for all timer, entry, and summary views.

- Click a project to start a timer; use the action panel to pause, log, reset, or discard.
- Add a manual entry, or use **Log Timer** to convert a running timer into an entry.
- View recent entries filtered by date, and expand any entry for full details.

### Keyboard Shortcuts

| Shortcut      | Action                |
| ------------- | --------------------- |
| `Cmd+D`       | Toggle detail view    |
| `Cmd+E`       | Edit selected entry   |
| `Cmd+Shift+D` | Delete selected entry |
| `Cmd+N`       | Add new entry         |
| `Cmd+[`       | Back to previous view |

## Documentation

- [Development Guide](docs/development.md) - Local setup and development workflow
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute
- [API Reference](docs/API.md) - Noko API integration details
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and fixes

## Contributing

Contributions are welcome. See the [Contributing Guide](docs/CONTRIBUTING.md) to get started.

## Support

- [GitHub Issues](https://github.com/JuanVqz/noko-for-raycast/issues)
- [GitHub Discussions](https://github.com/JuanVqz/noko-for-raycast/discussions)

## License

MIT - see [LICENSE](LICENSE).
