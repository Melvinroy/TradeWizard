# Auto-Commit & SuperClaude Integration

## Auto-Commit System
Automatically commit changes after major modifications for easy rollback capability.

### Trigger Conditions:
- File modifications > 5 files
- Code changes > 100 lines
- New components/modules added
- Configuration changes
- After SuperClaude operations

### Commit Message Format:
```
Auto-commit: [Type] Brief description

- Changes: List of modified files/features  
- Context: Why changes were made
- Impact: What functionality was affected

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

## SuperClaude Command Suggestions

Based on user comments, automatically suggest relevant SuperClaude commands:

### Command Mapping:
- **"fix"** → `/sc:troubleshoot [issue] --think --fix`
- **"improve"** → `/sc:improve [target] --focus [area] --safe`
- **"analyze"** → `/sc:analyze [target] --focus [area] --think`
- **"implement"** → `/sc:implement [feature] --persona-[type] --with-tests`
- **"clean"** → `/sc:cleanup [target] --remove-unused --fix-imports`
- **"document"** → `/sc:document [target] --type [format] --persona-scribe`
- **"test"** → `/sc:test [component] --type [unit|integration] --persona-qa`
- **"optimize"** → `/sc:improve [target] --focus performance --persona-performance`
- **"refactor"** → `/sc:improve [target] --focus readability --safe --persona-refactorer`
- **"debug"** → `/sc:troubleshoot [issue] --depth comprehensive --think-hard`

### Context-Aware Suggestions:
- React/Frontend → `--persona-frontend`
- Python/Backend → `--persona-backend` 
- Security issues → `--persona-security`
- Architecture → `--persona-architect`
- Performance → `--persona-performance`