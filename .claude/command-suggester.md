# SuperClaude Command Suggester

## Smart Command Suggestions Based on User Input

### Pattern Recognition:
When user mentions specific keywords, automatically suggest relevant SuperClaude commands.

### Suggestion Rules:

#### Development Tasks:
- **"add feature"** / **"implement"** / **"build"**
  ```
  💡 SuperClaude Suggestion:
  /sc:implement [feature-description] --persona-[frontend|backend] --with-tests --safe
  ```

- **"fix bug"** / **"debug"** / **"error"**
  ```
  💡 SuperClaude Suggestion:
  /sc:troubleshoot "[error-description]" --think-hard --persona-analyzer --fix
  ```

- **"improve performance"** / **"optimize"**
  ```
  💡 SuperClaude Suggestion:  
  /sc:improve [target] --focus performance --persona-performance --think
  ```

#### Code Quality:
- **"clean code"** / **"refactor"** / **"organize"**
  ```
  💡 SuperClaude Suggestion:
  /sc:cleanup [target] --remove-unused --fix-imports --format --safe
  /sc:improve [target] --focus readability --persona-refactorer
  ```

- **"code review"** / **"analyze"** / **"check"**
  ```
  💡 SuperClaude Suggestion:
  /sc:analyze [target] --focus quality --think --persona-analyzer
  ```

#### Testing & Documentation:
- **"write tests"** / **"testing"**
  ```
  💡 SuperClaude Suggestion:
  /sc:test [component] --type unit --persona-qa --with-coverage
  ```

- **"document"** / **"documentation"** / **"readme"**
  ```
  💡 SuperClaude Suggestion:
  /sc:document [target] --type api --persona-scribe --format markdown
  ```

#### Security & Architecture:
- **"security"** / **"vulnerability"** / **"secure"**
  ```
  💡 SuperClaude Suggestion:
  /sc:analyze [target] --focus security --persona-security --think-hard
  ```

- **"architecture"** / **"design"** / **"structure"**
  ```
  💡 SuperClaude Suggestion:
  /sc:design [system] --persona-architect --think-hard --type architecture
  ```

### Context-Aware Suggestions:

#### Project-Specific (TradeWizard):
- **"IBKR import"** / **"CSV issues"**
  ```
  💡 SuperClaude Suggestion:
  /sc:troubleshoot "IBKR CSV import multi-section format parsing" --think-hard --persona-backend --fix
  ```

- **"P&L calculations"** / **"profit loss"**
  ```
  💡 SuperClaude Suggestion:
  /sc:implement "P&L calculations for trades" --persona-backend --with-tests --safe
  ```

- **"chart performance"** / **"dashboard slow"**
  ```
  💡 SuperClaude Suggestion:
  /sc:improve @frontend/src/App.tsx --focus performance --persona-frontend --think
  ```

#### File-Type Specific:
- **"React component"** / **"frontend"**
  ```
  💡 SuperClaude Suggestion:
  /sc:[command] [target] --persona-frontend [additional-flags]
  ```

- **"Python backend"** / **"API"** / **"FastAPI"**
  ```
  💡 SuperClaude Suggestion:
  /sc:[command] [target] --persona-backend [additional-flags]
  ```

### Auto-Commit Integration:
After successful SuperClaude operations, automatically suggest:
```
🔄 Auto-commit suggested:
Changes detected from SuperClaude operation. Commit now for easy rollback?

Commit message: "Auto-commit: [Command] [Description]"
```