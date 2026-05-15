# Development Guide

This guide will help you set up the development environment for the Noko Raycast extension.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **macOS** 10.15+ (Catalina or later)
- **Node.js** 16.0 or higher
- **pnpm** (fast, disk space efficient package manager)
- **Raycast** (latest version)
- **Git** (for version control)

## 🚀 Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JuanVqz/noko-for-raycast.git
cd noko-for-raycast
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Raycast Development

1. **Open Raycast**
   - Press `Cmd + Space` to open Raycast
   - Type "Raycast" and press Enter

2. **Enable Developer Mode**
   - Go to Raycast Preferences (`Cmd + ,`)
   - Navigate to "Advanced"
   - Enable "Developer Mode"

3. **Add Development Extension**
   - In Raycast, type "Import Extension"
   - Select "Import from Folder"
   - Choose the `noko-for-raycast` folder you cloned

### 4. Configure Noko API Access

1. **Get Personal Access Token**
   - Log in to your [Noko account](https://nokotime.com)
   - Go to **Settings** → **Integration & Apps**
   - Click **Generate Personal Access Token**
   - Copy the token (you'll need it for development)

2. **Set Up Environment Variables**

   ```bash
   # Create a .env file in the project root
   echo "NOKO_PERSONAL_ACCESS_TOKEN=your_token_here" > .env
   ```

3. **Configure Raycast Preferences**
   - Open Raycast Preferences
   - Go to Extensions → Noko
   - Enter your Personal Access Token

### 5. Start Development Server

```bash
pnpm run dev
```

This will:

- Start the Raycast development server
- Watch for file changes
- Automatically reload the extension
- Show build logs in the terminal

## 🏗️ Project Structure

```
noko-for-raycast/
├── src/
│   ├── components/          # UI Components
│   │   ├── TimerItem.tsx    # Individual timer/project item
│   │   ├── EntryItem.tsx    # Individual entry display
│   │   ├── ErrorBoundary.tsx # Error handling wrapper
│   │   └── LoadingState.tsx # Loading state component
│   ├── views/               # View Components
│   │   ├── TimersView.tsx   # Main timers list view
│   │   ├── EntriesView.tsx  # Entries list with filtering
│   │   └── AddEntryView.tsx # Time entry creation form
│   ├── hooks/               # Custom React hooks
│   │   ├── useApiData.ts    # Data fetching and caching
│   │   ├── useTimerActions.ts # Timer control actions
│   │   ├── useElapsedTime.ts # Real-time timer updates
│   │   ├── useEntrySubmission.ts # Entry form handling
│   │   ├── useEntries.ts    # Entry filtering logic
│   │   └── useDetailToggle.ts # Detail view toggle
│   ├── lib/                 # Shared utilities
│   │   └── api-client.ts    # API client
│   ├── types.ts             # TypeScript definitions
│   ├── constants.ts         # Application constants
│   ├── utils.ts             # Utility functions
│   └── timers.tsx           # Main command entry point
├── docs/                    # Documentation
├── assets/                  # Extension assets
├── package.json             # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🧪 Development Workflow

### Making Changes

1. **Edit Code**
   - Make changes to any file in the `src/` directory
   - The development server will automatically rebuild

2. **Test Changes**
   - Open Raycast (`Cmd + Space`)
   - Type "Timers" to access your extension
   - Test your changes

3. **Debug Issues**
   - Check the terminal for build errors
   - Use browser dev tools if needed
   - Check Raycast's developer console

### Code Quality

#### Run Prettier (Code Formatting)

```bash
# Format all files
npx prettier --write .

# Or using the local binary
./node_modules/.bin/prettier --write .
```

#### Run TypeScript Check

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

#### Run Linter

```bash
# Check for linting issues
pnpm run lint
```

## 🔧 Available Scripts

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Lint code
pnpm run lint

# Fix linting issues
pnpm run fix-lint

# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

## 🐛 Debugging

### Common Issues

1. **Extension Not Loading**
   - Check if Raycast Developer Mode is enabled
   - Verify the extension is properly imported
   - Check terminal for build errors

2. **API Errors**
   - Verify your Personal Access Token is correct
   - Check Noko API status
   - Ensure your token has proper permissions

3. **Build Errors**
   - Run `pnpm install` to ensure dependencies are installed
   - Check TypeScript errors with `npx tsc --noEmit`
   - Verify all imports are correct

### Debug Tools

1. **Raycast Developer Console**
   - Open Raycast Preferences
   - Go to Advanced → Developer Console
   - View logs and errors

2. **Browser Dev Tools**
   - Right-click in Raycast
   - Select "Inspect Element"
   - Use standard browser dev tools

## 📦 Building for Production

```bash
# Build the extension
pnpm run build

# The built extension will be in the dist/ folder
```

## 🚀 Deployment

### Publishing to Raycast Store

1. **Prepare for Release**

   ```bash
   pnpm run build
   pnpm run lint
   pnpm test
   ```

2. **Create Release**
   - Tag your release: `git tag v1.0.0`
   - Push tags: `git push origin v1.0.0`
   - Create a GitHub release

3. **Submit to Raycast**
   - Follow Raycast's extension submission process
   - Provide all required information
   - Wait for review and approval

## 🤝 Contributing

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Test Thoroughly**
5. **Commit Your Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**

## 📚 Additional Resources

- [Raycast API Documentation](https://developers.raycast.com/)
- [Noko API Documentation](https://developer.nokotime.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🆘 Getting Help

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Raycast Community**: Join the Raycast Discord/community
- **Noko Support**: Contact Noko support for API issues
