# 🤖 git-ai

An AI-powered CLI tool that reads your git diff and generates commit messages.

## ✨ Features

- **AI-Generated Commit Messages**: Analyzes your staged changes and generates contextual commit messages
- **Multiple Commit Styles**: Support for conventional commits, standard, and detailed formats
- **Interactive Mode**: Review and edit generated messages before committing
- **TypeScript**: Full type safety and excellent developer experience
- **Configurable**: Customize AI models, commit styles, and preferences
- **Smart Context**: Uses repository name, branch, and recent commits for better generation

## 🚀 Quick Start
### Installation

```bash
# Clone the repository
git clone https://github.com/hauran/git-ai
cd git-ai

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (recommended)
npm install -g .
```

### Setup

1. **Get your OpenAI API key**:
   
   - Visit [API Keys page](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Save this key for the next step. 
   

2. **Configure your API key** :

   ```bash
   # Works from any directory
   echo "OPENAI_API_KEY=your_key_here" > ~/.git-ai/.env
   ```

   Your `.env` file can also include optional settings:
   ```env
   OPENAI_API_KEY=your_key_here
   AI_MODEL=gpt-4o-mini
   AI_MAX_TOKENS=150
   AI_TEMPERATURE=0.7
   DEFAULT_COMMIT_STYLE=conventional
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
```

### Command Options

```bash
git-ai [options]

Options:
  -c, --commit          Automatically commit with generated message
  -s, --style <type>    Commit message style (conventional|standard|detailed)
  -h, --help           Display help information
```

### Environment Variables

git-ai automatically reads configuration from `.env` files or environment variables:

**Using global .env file:**
```bash
# Create the config directory if it doesn't exist
mkdir -p ~/.git-ai

# Create the .env file
cat > ~/.git-ai/.env << EOF
OPENAI_API_KEY=your-api-key
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=150
AI_TEMPERATURE=0.7
DEFAULT_COMMIT_STYLE=conventional
EOF
```

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

## 🔒 Security & Privacy

- **API Key**: Your OpenAI API key is stored locally
- **Code Analysis**: Only staged git diffs are sent to OpenAI for analysis
- **No Storage**: Your code is not stored or logged by this tool
- **Rate Limiting**: Respects OpenAI's rate limits and includes error handling
