# Smart Commit Generator

Use this prompt to analyze current git changes and create a meaningful commit with appropriate message.

## Command: /commit

## Instructions

**Task**: Analyze current git changes, stage files, and create a comprehensive commit message that accurately describes the modifications.

### Steps Required:

1. **Analyze Current Changes**:
   - Run `git status` to see modified and untracked files
   - Use `git diff --name-only` to get list of changed files
   - Check key diffs with `git diff [important-files]` to understand scope of changes

2. **Categorize Changes**:
   - **feat**: New features or functionality
   - **fix**: Bug fixes
   - **docs**: Documentation updates
   - **refactor**: Code refactoring without functionality changes
   - **style**: Code style/formatting changes
   - **chore**: Maintenance tasks, dependency updates
   - **build**: Build system or external dependency changes
   - **ci**: CI/CD configuration changes

3. **Generate Commit Message Format**:
   ```
   type: brief summary (50 chars or less)
   
   - Detailed bullet point 1
   - Detailed bullet point 2
   - Detailed bullet point 3
   
   [Additional context if needed, such as version numbers, IDs, etc.]
   ```

4. **Key Information to Include**:
   - Version changes (if app.json/package.json modified)
   - Configuration updates (build.gradle, app.json)
   - New integrations or SDK additions
   - File movements or structural changes
   - Production-relevant details (keystore, signing, deployment info)
   - Breaking changes or migration notes

5. **Execute Commit**:
   - Stage all changes: `git add .`
   - Create commit with generated message
   - Verify commit success

### Commit Message Guidelines:
- **First line**: Imperative mood, under 50 characters
- **Body**: Explain what and why, not how
- **Details**: Use bullet points for clarity
- **Context**: Include relevant technical identifiers
- **Scope**: Be specific about areas affected

### Example Patterns:
```bash
# Feature addition
feat: add new payment integration with Stripe SDK

# Version update
feat: production build v1.2.0 with enhanced security

# Bug fix
fix: resolve crash on Android API 31+ devices

# Documentation
docs: update deployment guide with keystore instructions

# Configuration
build: configure TikTok SDK 1.5.0 with ProGuard rules
```

### Analysis Checklist:
- [ ] Check version numbers in app.json, package.json, build.gradle
- [ ] Identify new dependencies or SDK integrations
- [ ] Note configuration changes (signing, plugins, etc.)
- [ ] Detect file moves or package structure changes
- [ ] Review documentation updates
- [ ] Check for production-relevant modifications

### Usage Example:
```
/commit
```

**Expected Response**: 
1. Analyze current git status and changes
2. Generate appropriate commit type and message
3. Stage all files and execute commit
4. Provide commit hash and summary of what was committed