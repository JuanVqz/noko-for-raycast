# Changelog

All notable changes to the Noko Raycast extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation suite
- API reference documentation
- Contributing guidelines
- Troubleshooting guide
- Development setup instructions

### Changed

- Refactored all components to use optimized architecture
- Improved error handling and user feedback
- Enhanced performance with better memoization
- Streamlined code organization

### Removed

- Legacy components and duplicate code
- Unused dependencies and imports

## [1.0.0] - 2024-01-XX

### Added

- **Unified Timer Management**

  - Single command interface for all timer operations
  - Real-time elapsed time display for running timers
  - Smart sorting (Running → Paused → Inactive projects)
  - Project-based organization with timer status

- **Timer Controls**

  - Start timer on any project
  - Pause/Resume timers while preserving elapsed time
  - Log timer as time entry with description
  - Discard timer without saving time

- **Time Entry Management**

  - Quick manual entry creation with project selection
  - Smart defaults using project billing increments
  - Flexible time input ("h:mm" format and minutes)
  - Tag support for better organization
  - Entry history with date filtering

- **Enhanced User Experience**

  - Error boundaries for graceful error handling
  - Loading states with clear feedback
  - Toast notifications for all actions
  - Keyboard shortcuts for common operations
  - Expandable detail views

- **Technical Features**
  - Centralized API client with robust error handling
  - Optimized React hooks with proper memoization
  - TypeScript with strict typing
  - Real-time timer updates
  - Efficient data fetching and caching

### Technical Details

- Built with React and TypeScript
- Uses Raycast API for native macOS integration
- Integrates with Noko Time Tracking API v2
- Optimized for performance and reliability
- Comprehensive error handling and user feedback

## [0.1.0] - 2024-01-XX

### Added

- Initial release
- Basic timer functionality
- Project listing
- Entry creation
- Simple UI components

---

## Version History

- **v1.0.0**: Complete refactor with unified interface and enhanced features
- **v0.1.0**: Initial release with basic functionality

## Migration Guide

### From v0.1.0 to v1.0.0

The extension has been completely refactored for better performance and user experience:

1. **Unified Interface**: All timer operations are now in a single "Timers" command
2. **Enhanced Features**: Real-time updates, better error handling, and improved UX
3. **Performance**: Optimized components and efficient data fetching
4. **Documentation**: Comprehensive guides and troubleshooting information

### Breaking Changes

- **Command Structure**: Old separate commands (`add-entry`, `entries`, `timers`) are now unified
- **Component Architecture**: All components have been refactored for better performance
- **API Integration**: Improved error handling and response parsing

### Upgrade Instructions

1. **Update Extension**: Install the latest version from Raycast
2. **Reconfigure**: Re-enter your Personal Access Token if needed
3. **Explore New Features**: Check out the unified interface and new capabilities

## Support

For questions about version updates or migration:

- **Issues**: [GitHub Issues](https://github.com/your-username/noko-raycast/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/noko-raycast/discussions)
- **Documentation**: [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
