# 🤖 git-ai

An AI-powered CLI tool that reads your git diff and generates intelligent commit messages using OpenAI's GPT models.

## ✨ Features

- **AI-Generated Commit Messages**: Analyzes your staged changes and generates contextual commit messages
- **Multiple Commit Styles**: Support for conventional commits, standard, and detailed formats
- **Interactive Mode**: Review and edit generated messages before committing
- **TypeScript**: Full type safety and excellent developer experience
- **Configurable**: Customize AI models, commit styles, and preferences
- **Smart Context**: Uses repository name, branch, and recent commits for better generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- Git repository
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd git-ai

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm install -g .
```

### Setup

1. **Get your OpenAI API key**:
   - Visit https://platform.openai.com/api-keys
   - Create a new API key

2. **Configure your API key** (choose one method):

   **Option A: .env file (recommended)**
   ```bash
   # In your project root directory
   echo "OPENAI_API_KEY=your_key_here" > .env
   ```

   Your `.env` file can also include optional settings:
   ```env
   OPENAI_API_KEY=your_key_here
   AI_MODEL=gpt-3.5-turbo
   AI_MAX_TOKENS=150
   AI_TEMPERATURE=0.7
   DEFAULT_COMMIT_STYLE=conventional
   ```

   **Option B: Environment variable**
   ```bash
   export OPENAI_API_KEY=your_key_here
   ```

   **Option C: CLI configuration**
   ```bash
   git-ai config --api-key YOUR_API_KEY
   ```

3. **You're ready to go!**

## 📖 Usage

### Basic Usage

```bash
# Stage your changes
git add .

# Generate commit message
git-ai

# Generate and commit automatically
git-ai --commit

# Interactive mode (review before committing)
git-ai --interactive
```

### Command Options

```bash
git-ai [options]

Options:
  -c, --commit          Automatically commit with generated message
  -i, --interactive     Interactive mode for message review
  -s, --style <type>    Commit message style (conventional|standard|detailed)
  --dry-run            Show what would be committed without committing
  -v, --verbose        Verbose output
  -h, --help           Display help information
```

### Configuration

```bash
# Set your API key
git-ai config --api-key YOUR_KEY

# Set default AI model
git-ai config --model gpt-4

# Set default commit style
git-ai config --style conventional

# Show current configuration
git-ai config --show
```

### Commit Styles

#### Conventional Commits
```bash
git-ai --style conventional
# Output: feat(auth): add OAuth2 login support
```

#### Standard Commits
```bash
git-ai --style standard
# Output: Add OAuth2 login support
```

#### Detailed Commits
```bash
git-ai --style detailed
# Output: Add OAuth2 login support
#         
#         Implements OAuth2 authentication flow with Google and GitHub providers.
#         Adds login redirect handling and token management.
```

## 🔧 Configuration

Configuration is loaded in the following priority order:
1. **Environment variables** (highest priority)
2. **Config file** `~/.git-ai/config.json` 
3. **Default values** (lowest priority)

You can edit the config file directly or use the CLI commands, but environment variables will always override other settings.

### Environment Variables

git-ai automatically reads configuration from `.env` files or environment variables:

**Using .env file (recommended):**
```env
OPENAI_API_KEY=your-api-key
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=150
AI_TEMPERATURE=0.7
DEFAULT_COMMIT_STYLE=conventional
```

**Using shell environment:**
```bash
export OPENAI_API_KEY="your-api-key"
export AI_MODEL="gpt-3.5-turbo"
export AI_MAX_TOKENS="150"
export AI_TEMPERATURE="0.7"
export DEFAULT_COMMIT_STYLE="conventional"
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `ai.apiKey` | OpenAI API key | Required |
| `ai.model` | AI model to use | `gpt-3.5-turbo` |
| `ai.maxTokens` | Maximum tokens for response | `150` |
| `ai.temperature` | AI creativity (0-2) | `0.7` |
| `git.defaultStyle` | Default commit style | `conventional` |
| `git.maxDiffSize` | Maximum diff size to analyze | `50000` |
| `ui.colorOutput` | Enable colored output | `true` |

## 🛠️ Development

### Project Structure

```
git-ai/
├── src/
│   ├── types.ts      # TypeScript type definitions
│   ├── config.ts     # Configuration management
│   ├── git.ts        # Git operations
│   ├── ai.ts         # AI service integration
│   ├── cli.ts        # CLI entry point
│   ├── index.ts      # Main application logic
│   └── utils.ts      # Utility functions
├── dist/             # Compiled JavaScript
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

### Available Scripts

```bash
npm run build        # Compile TypeScript
npm run dev          # Run in development mode
npm run test         # Run tests
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
```

### Building from Source

```bash
# Clone and install
git clone <repository-url>
cd git-ai
npm install

# Build
npm run build

# Test locally
./dist/cli.js --help

# Install globally
npm install -g .
```

## 🔒 Security & Privacy

- **API Key**: Your OpenAI API key is stored locally in `~/.git-ai/config.json`
- **Code Analysis**: Only staged git diffs are sent to OpenAI for analysis
- **No Storage**: Your code is not stored or logged by this tool
- **Rate Limiting**: Respects OpenAI's rate limits and includes error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Run linting: `npm run lint:fix`
6. Commit using conventional commits: `git-ai --style conventional`
7. Push and create a Pull Request

## 📝 Examples

### Typical Workflow

```bash
# Make some changes to your code
echo "console.log('Hello World');" > hello.js

# Stage the changes
git add hello.js

# Generate commit message
git-ai
# Output: feat: add hello world example

# Or commit automatically
git-ai --commit
```

### Interactive Mode

```bash
git-ai --interactive
# 📝 Generated commit message:
# feat: add user authentication system
# 
# What would you like to do?
# ✅ Commit with this message
# ✏️  Edit the message  
# 🔄 Regenerate message
# ❌ Cancel
```

## 🐛 Troubleshooting

### Common Issues

**"No staged changes found"**
```bash
# Make sure you've staged your changes
git add .
```

**"OpenAI API key not found"**
```bash
# Create .env file (recommended)
echo "OPENAI_API_KEY=your_key_here" > .env

# Or set environment variable
export OPENAI_API_KEY=your_key_here

# Or use CLI config
git-ai config --api-key YOUR_KEY
```

**"Not in a git repository"**
```bash
# Initialize git repository
git init
```

**Module import errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT models
- The git community for building such an amazing tool
- All contributors who help improve this project

---

Made with ❤️ for developers who love clean commit messages 