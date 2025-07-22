# SuperClaude User Guide 🚀

Complete guide to using SuperClaude v3.0 - the AI-enhanced development framework for Claude Code.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Available Commands](#available-commands) 
3. [Personas System](#personas-system)
4. [Flags & Options](#flags--options)
5. [Real-World Examples](#real-world-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

SuperClaude enhances Claude Code with specialized commands that start with `/sc:`. Simply type any command in Claude Code chat.

### Basic Usage Pattern:
```
/sc:command [arguments] [--flags]
```

### Your First SuperClaude Command:
```
/sc:analyze . --focus quality --depth quick
```
This analyzes your current project for code quality issues.

---

## Available Commands

SuperClaude provides 16 specialized commands organized by category:

### 🛠️ Development Commands

**`/sc:implement [feature-description]`**
- **Purpose**: Implement new features, components, or code functionality
- **Auto-activates**: Relevant personas (frontend, backend, security)
- **Examples**:
  ```
  /sc:implement user login form --type component --framework react
  /sc:implement REST API for trades --type api --with-tests
  /sc:implement CSV import feature --type feature --safe
  ```

**`/sc:build [target]`** 
- **Purpose**: Build and compile projects with framework detection
- **Auto-detects**: package.json, requirements.txt, Cargo.toml, etc.
- **Examples**:
  ```
  /sc:build frontend --optimize
  /sc:build . --watch
  /sc:build backend --production
  ```

**`/sc:design [component/system]`**
- **Purpose**: Create UI/UX designs or system architecture
- **Auto-activates**: Architect or Frontend personas
- **Examples**:
  ```
  /sc:design trading dashboard --type ui
  /sc:design database schema --type architecture
  ```

### 🔍 Analysis Commands

**`/sc:analyze [target]`**
- **Purpose**: Comprehensive code analysis (quality, security, performance)
- **Options**: `--focus quality|security|performance|architecture`
- **Examples**:
  ```
  /sc:analyze backend/ --focus security --depth deep
  /sc:analyze src/components --focus performance
  /sc:analyze . --focus architecture
  ```

**`/sc:troubleshoot [issue]`**
- **Purpose**: Debug problems and identify root causes
- **Auto-activates**: Analyzer persona
- **Examples**:
  ```
  /sc:troubleshoot "CSV import failing on Windows"
  /sc:troubleshoot authentication errors --verbose
  ```

**`/sc:explain [code/concept]`**
- **Purpose**: Explain code, patterns, or technical concepts
- **Examples**:
  ```
  /sc:explain @src/utils/dragDrop.ts
  /sc:explain "how JWT authentication works"
  ```

### ✨ Quality Commands

**`/sc:improve [target]`**
- **Purpose**: Enhance code quality, performance, and maintainability
- **Auto-activates**: Refactorer persona
- **Examples**:
  ```
  /sc:improve @src/App.tsx --focus performance
  /sc:improve backend/app/main.py --focus readability
  ```

**`/sc:test [component]`**
- **Purpose**: Generate tests and testing strategies
- **Auto-activates**: QA persona
- **Examples**:
  ```
  /sc:test @src/components/LoginForm.tsx --type unit
  /sc:test backend/app/modules/auth --type integration
  ```

**`/sc:cleanup [target]`**
- **Purpose**: Remove dead code, optimize imports, fix formatting
- **Examples**:
  ```
  /sc:cleanup frontend/src --remove-unused
  /sc:cleanup . --fix-imports --format
  ```

### 📚 Documentation Commands

**`/sc:document [target]`**
- **Purpose**: Generate documentation, README files, API docs
- **Auto-activates**: Scribe persona
- **Examples**:
  ```
  /sc:document @backend/app/modules/auth --type api
  /sc:document . --type readme
  /sc:document @src/components --type storybook
  ```

### 🔧 Utility Commands

**`/sc:git [operation]`**
- **Purpose**: Git operations with intelligent commit messages
- **Examples**:
  ```
  /sc:git commit "fix CSV import issues"
  /sc:git branch feature/trade-tagging
  /sc:git merge develop --safe
  ```

**`/sc:task [description]`**
- **Purpose**: Break down complex tasks into manageable steps
- **Examples**:
  ```
  /sc:task "implement trading journal with tagging system"
  /sc:task "migrate from SQLite to PostgreSQL"
  ```

**`/sc:estimate [feature]`**
- **Purpose**: Estimate development time and complexity
- **Examples**:
  ```
  /sc:estimate "add real-time P&L calculations"
  /sc:estimate "implement multi-broker support"
  ```

### 📁 Project Commands

**`/sc:index [directory]`**
- **Purpose**: Create project structure overviews
- **Examples**:
  ```
  /sc:index frontend/src --depth 3
  /sc:index . --include-docs
  ```

**`/sc:load [target]`**
- **Purpose**: Load and analyze project files
- **Examples**:
  ```
  /sc:load @package.json @requirements.txt
  /sc:load backend/ --pattern "*.py"
  ```

**`/sc:spawn [template]`**
- **Purpose**: Generate new projects or components from templates
- **Examples**:
  ```
  /sc:spawn react-component TradeCard --props symbol,pnl,date
  /sc:spawn fastapi-router trades --crud
  ```

**`/sc:workflow [process]`**
- **Purpose**: Create or optimize development workflows
- **Examples**:
  ```
  /sc:workflow "deploy to production" --platform vercel
  /sc:workflow "run tests" --ci github-actions
  ```

---

## Personas System

SuperClaude automatically activates AI specialists based on your task context. You can also manually specify personas.

### Available Personas:

**🏗️ `--persona-architect`**
- **Specializes in**: Systems design, scalability, long-term architecture
- **Auto-activates for**: System design, database schemas, API architecture
- **Best for**: Planning large features, technical decisions

**🎨 `--persona-frontend`** 
- **Specializes in**: UI/UX, React/Vue, accessibility, user experience
- **Auto-activates for**: Component development, styling, user interfaces
- **Best for**: Building user-facing features, design systems

**⚙️ `--persona-backend`**
- **Specializes in**: APIs, databases, server logic, performance
- **Auto-activates for**: Server-side development, database design
- **Best for**: Building APIs, data processing, authentication

**🔍 `--persona-analyzer`**
- **Specializes in**: Debugging, root cause analysis, investigation
- **Auto-activates for**: Troubleshooting, error analysis, performance issues
- **Best for**: Solving complex problems, debugging issues

**🛡️ `--persona-security`**
- **Specializes in**: Security vulnerabilities, threat modeling, best practices
- **Auto-activates for**: Authentication, authorization, data protection
- **Best for**: Security reviews, implementing secure features

**✍️ `--persona-scribe`**
- **Specializes in**: Documentation, technical writing, API docs
- **Auto-activates for**: Documentation tasks, README generation
- **Best for**: Creating clear, comprehensive documentation

**🧪 `--persona-qa`**
- **Specializes in**: Testing strategies, quality assurance, validation
- **Auto-activates for**: Test generation, quality reviews
- **Best for**: Ensuring code quality, writing tests

### Using Personas Manually:
```
/sc:implement authentication system --persona-security
/sc:analyze frontend/src --persona-performance --depth deep
/sc:document @backend/app/main.py --persona-scribe
```

---

## Flags & Options

SuperClaude flags enhance command behavior and provide fine-grained control.

### 🧠 Thinking Flags

**`--think`** - Multi-file analysis (~4K tokens)
- **Use when**: Analyzing complex relationships between files
- **Auto-activates**: Sequential MCP server, Analyzer persona

**`--think-hard`** - Deep architectural analysis (~10K tokens) 
- **Use when**: System refactoring, major architectural decisions
- **Auto-activates**: Sequential + Context7 MCP servers, Architect persona

**`--ultrathink`** - Maximum depth analysis (~32K tokens)
- **Use when**: Critical system redesigns, complex legacy modernization
- **Auto-activates**: All MCP servers, multiple personas

### 📋 Planning Flags

**`--plan`** - Show execution plan before running
- **Use when**: You want to see what will happen before execution
- **Example**: `/sc:implement payment system --plan`

**`--safe`** - Conservative approach with safety checks
- **Use when**: Working on production code or critical systems
- **Example**: `/sc:improve @src/App.tsx --safe`

### 🎯 Focus Flags

**`--focus [area]`** - Concentrate on specific aspects
- **Options**: quality, security, performance, architecture, readability
- **Example**: `/sc:analyze . --focus security`

**`--depth [level]`** - Control analysis depth
- **Options**: quick, deep, comprehensive
- **Example**: `/sc:troubleshoot "slow API" --depth comprehensive`

### 📊 Output Flags

**`--verbose`** - Detailed output and explanations
**`--quiet`** - Minimal output, focus on results
**`--format [type]`** - Output format (text, json, report, markdown)

### Example Usage:
```
/sc:analyze backend/ --think-hard --focus security --verbose --format report
/sc:implement user dashboard --persona-frontend --safe --with-tests --plan
```

---

## Real-World Examples

Here are practical examples using SuperClaude with your TradeWizard project:

### 1. Fix the IBKR CSV Import Issue
```
/sc:troubleshoot "IBKR CSV import fails to parse multi-section format" --depth deep --think
```

### 2. Implement P&L Calculations
```
/sc:implement P&L calculations for trades --type feature --safe --with-tests --persona-backend
```

### 3. Add Trade Tagging System  
```
/sc:implement trade tagging system --type feature --framework react --with-tests
```

### 4. Security Review
```
/sc:analyze backend/ --focus security --persona-security --think --format report
```

### 5. Performance Optimization
```
/sc:improve @frontend/src/App.tsx --focus performance --think --verbose
```

### 6. Generate API Documentation
```
/sc:document @backend/app/modules/tradelog/router.py --type api --persona-scribe
```

### 7. Create Component Tests
```
/sc:test @frontend/src/components/LoginForm.tsx --type unit --persona-qa --verbose
```

### 8. Plan a Complex Feature
```
/sc:task "implement calendar view with daily P&L visualization" --think --plan
```

### 9. Database Migration Planning
```
/sc:design PostgreSQL migration from SQLite --persona-architect --think-hard
```

### 10. Code Cleanup
```
/sc:cleanup frontend/src --remove-unused --fix-imports --format --safe
```

---

## Best Practices

### 1. **Start Small, Think Big**
```
# Good: Start with focused analysis
/sc:analyze @backend/app/modules/tradelog/service.py --focus quality

# Then expand to system-wide
/sc:analyze backend/ --focus architecture --think-hard
```

### 2. **Use Appropriate Thinking Levels**
- **`--think`**: For multi-file analysis (3-10 files)
- **`--think-hard`**: For system-wide changes (10+ files, architectural decisions)  
- **`--ultrathink`**: For critical system redesigns only

### 3. **Combine Personas with Focus**
```
/sc:implement authentication --persona-security --focus security --safe
/sc:improve performance --persona-performance --focus performance --think
```

### 4. **Plan Before Implementing**
```
/sc:implement complex-feature --plan --think  # See what will happen
/sc:implement complex-feature --safe         # Then execute safely
```

### 5. **Use Context Appropriately**
```
# Analyze specific files
/sc:analyze @src/App.tsx @src/components/Dashboard.tsx

# Analyze directories
/sc:analyze frontend/src/components --focus quality

# Analyze patterns
/sc:analyze backend/ --pattern "*.py" --focus security
```

---

## Troubleshooting

### Command Not Working?

1. **Check Command Syntax**
   ```
   # Correct
   /sc:analyze . --focus quality
   
   # Incorrect  
   /analyze . --focus quality
   ```

2. **Verify Installation**
   ```
   # Check if SuperClaude is installed
   ls ~/.claude
   
   # Should see: CLAUDE.md, COMMANDS.md, PERSONAS.md, etc.
   ```

3. **Check File Paths**
   ```
   # Use @ prefix for specific files
   /sc:analyze @src/App.tsx
   
   # Use . for current directory
   /sc:analyze .
   
   # Use relative paths for directories
   /sc:analyze frontend/src
   ```

### Common Issues:

**Issue**: Persona not activating
**Solution**: Use explicit persona flags: `--persona-frontend`

**Issue**: Too much/little analysis depth  
**Solution**: Adjust thinking flags: `--think`, `--think-hard`, `--ultrathink`

**Issue**: Command seems slow
**Solution**: Use `--quick` or `--depth quick` for faster results

**Issue**: Output too verbose/brief
**Solution**: Use `--verbose` or `--quiet` flags

### Getting Help:

**List all commands**: Check `~/.claude/COMMANDS.md`
**List all personas**: Check `~/.claude/PERSONAS.md`  
**List all flags**: Check `~/.claude/FLAGS.md`

---

## Advanced Usage

### Chaining Commands
```bash
# Analyze, then improve, then test
/sc:analyze @src/App.tsx --focus performance
# Based on results:
/sc:improve @src/App.tsx --focus performance --safe  
# Then verify:
/sc:test @src/App.tsx --type performance
```

### Complex Workflows
```bash
# Full feature development workflow
/sc:task "implement user authentication system" --plan
/sc:design authentication system --persona-architect --type system
/sc:implement authentication --persona-security --safe --with-tests
/sc:test authentication --persona-qa --type integration
/sc:document authentication --persona-scribe --type api
```

### Integration with Your TradeWizard Project
```bash
# Project setup and analysis
/sc:index . --depth 2                              # Understand structure
/sc:analyze . --focus architecture --think         # Architectural overview  
/sc:troubleshoot "CSV import issues" --think-hard  # Fix current issues
/sc:implement "P&L calculations" --safe --with-tests  # Add missing features
/sc:improve . --focus performance --persona-performance  # Optimize
```

---

This guide covers all the essential aspects of using SuperClaude effectively. Start with simple commands and gradually explore more advanced features as you become comfortable with the system.

**Happy coding with SuperClaude! 🚀**