# Smart Commit and Push Generator

Use this prompt to analyze current git changes, create a meaningful commit, and push to remote repository.

## Command: /commit-and-push

## Instructions

**Task**: Analyze current git changes, stage files, create a comprehensive commit message, and push changes to remote repository.

### Steps Required:

1. **Analyze Current Changes** (same as /commit):
   - Run `git status` to see modified and untracked files
   - Use `git diff --name-only` to get list of changed files
   - Check key diffs with `git diff [important-files]` to understand scope of changes

2. **Categorize Changes** (same as /commit):
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

4. **Execute Commit and Push Workflow**:
   - Stage all changes: `git add .`
   - Create commit with generated message
   - Check remote status: `git remote -v`
   - Push to remote: `git push origin main` (or current branch)
   - Verify push success and provide remote URL info

5. **Push Safety Checks**:
   - Verify current branch name before pushing
   - Check if remote repository is accessible
   - Confirm push was successful with commit count
   - Report any push conflicts or issues

### Key Information to Include (same as /commit):
- Version changes (if app.json/package.json modified)
- Configuration updates (build.gradle, app.json)
- New integrations or SDK additions
- File movements or structural changes
- Production-relevant details (keystore, signing, deployment info)
- Breaking changes or migration notes

### Additional Push Information:
- Current branch being pushed
- Remote repository URL
- Number of commits being pushed
- Any upstream tracking information
- Push success confirmation

### Commit Message Guidelines (same as /commit):
- **First line**: Imperative mood, under 50 characters
- **Body**: Explain what and why, not how
- **Details**: Use bullet points for clarity
- **Context**: Include relevant technical identifiers
- **Scope**: Be specific about areas affected

### Example Workflow:
```bash
# 1. Analyze changes
git status
git diff --name-only

# 2. Stage and commit
git add .
git commit -m "feat: add new feature with comprehensive details"

# 3. Push to remote
git push origin main

# 4. Verify and report
echo "✅ Changes committed and pushed successfully"
echo "📍 Remote: origin/main"
echo "🔗 Repository: [repository-url]"
```

### Error Handling:
- **Merge conflicts**: Report conflicts and suggest resolution steps
- **Network issues**: Provide retry suggestions and alternative sync methods
- **Authentication**: Guide through credential setup if needed
- **Force push warnings**: Never use force push, suggest alternative approaches
- **Large files**: Detect and exclude files that exceed repository limits

### Analysis Checklist (same as /commit):
- [ ] Check version numbers in app.json, package.json, build.gradle
- [ ] Identify new dependencies or SDK integrations
- [ ] Note configuration changes (signing, plugins, etc.)
- [ ] Detect file moves or package structure changes
- [ ] Review documentation updates
- [ ] Check for production-relevant modifications

### Additional Push Checklist:
- [ ] Verify current branch is correct for pushing
- [ ] Check remote repository accessibility
- [ ] Ensure no uncommitted changes remain
- [ ] Confirm push success with remote sync
- [ ] Report final repository state
- [ ] Validate no large files are being pushed

### Usage Example:
```
/commit-and-push
```

**Expected Response**: 
1. Analyze current git status and changes
2. Generate appropriate commit type and message
3. Stage all files and execute commit
4. Push changes to remote repository
5. Provide commit hash, push confirmation, and repository status
6. Report any issues or conflicts that need attention

### Benefits:
- **Complete workflow**: From analysis to remote sync in one command
- **Safety checks**: Validates remote access and branch status
- **Comprehensive reporting**: Full status of local and remote state
- **Error handling**: Guides through common push issues and conflicts
- **Large file protection**: Prevents repository size limit issues