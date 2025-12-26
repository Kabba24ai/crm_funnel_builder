# Git Setup and Sharing Guide

This document explains how to set up and share this project via Git.

## Initial Git Setup

### 1. Initialize Git Repository (if not already done)

```bash
# Check if Git is already initialized
git status

# If not initialized, run:
git init
```

### 2. Configure Git Commit Template (Optional but Recommended)

```bash
# Set up commit message template
git config --local commit.template .gitmessage

# This will use the template whenever you run git commit
```

### 3. Verify .gitignore

The project includes a `.gitignore` file that excludes:
- `node_modules/` - Dependencies (large, should be installed locally)
- `dist/` - Build output (generated, not source code)
- `.env` - Environment variables (contains secrets)
- Log files and OS-specific files

Verify it's working:
```bash
git status
# You should NOT see node_modules, dist, or .env in the list
```

### 4. Make Initial Commit

```bash
# Stage all files
git add .

# Commit with descriptive message
git commit -m "Initial commit: Sales Funnel Automation CRM v0.2.0

- Complete funnel management system
- Edge Functions architecture
- Category and message template systems
- Comprehensive documentation
"
```

## Setting Up Remote Repository

### Option 1: GitHub

#### Create New Repository

1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Fill in:
   - **Name**: sales-funnel-automation-crm
   - **Description**: Sales funnel management system with automated messaging
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README (we already have one)
4. Click "Create repository"

#### Connect and Push

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/sales-funnel-automation-crm.git

# Verify remote was added
git remote -v

# Push code to GitHub
git branch -M main
git push -u origin main
```

### Option 2: GitLab

#### Create New Project

1. Go to [GitLab](https://gitlab.com)
2. Click "New project" > "Create blank project"
3. Fill in:
   - **Project name**: Sales Funnel Automation CRM
   - **Visibility Level**: Private or Internal
   - **Initialize with README**: Uncheck
4. Click "Create project"

#### Connect and Push

```bash
# Add GitLab as remote
git remote add origin https://gitlab.com/YOUR_USERNAME/sales-funnel-automation-crm.git

# Push code to GitLab
git branch -M main
git push -u origin main
```

### Option 3: Bitbucket

#### Create New Repository

1. Go to [Bitbucket](https://bitbucket.org)
2. Click "Create repository"
3. Fill in project details
4. Click "Create repository"

#### Connect and Push

```bash
# Add Bitbucket as remote
git remote add origin https://bitbucket.org/YOUR_USERNAME/sales-funnel-automation-crm.git

# Push code
git branch -M main
git push -u origin main
```

## Branch Strategy

We recommend using Git Flow or GitHub Flow:

### GitHub Flow (Simpler)

```
main (production)
  ├── feature/add-webhooks
  ├── fix/category-bug
  └── docs/update-readme
```

**Workflow:**
1. Create branch from `main`
2. Make changes
3. Create pull request
4. Review and merge to `main`

### Git Flow (More Structure)

```
main (production)
develop (integration)
  ├── feature/add-webhooks
  ├── fix/category-bug
  └── release/v0.3.0
```

**Workflow:**
1. Create feature branch from `develop`
2. Make changes
3. Merge to `develop`
4. Create release branch
5. Merge to both `main` and `develop`

## Branch Naming Convention

```
feature/   - New features (feature/webhook-support)
fix/       - Bug fixes (fix/category-delete-error)
docs/      - Documentation (docs/api-documentation)
refactor/  - Code refactoring (refactor/api-client)
test/      - Test additions (test/funnel-creation)
chore/     - Maintenance (chore/update-dependencies)
```

## Setting Up Branch Protection

### On GitHub:

1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Dismiss stale reviews when new commits are pushed
   - ✅ Require status checks to pass (when CI/CD is set up)
   - ✅ Require branches to be up to date

### On GitLab:

1. Go to Settings > Repository > Protected Branches
2. Protect `main` branch
3. Set:
   - Allowed to merge: Maintainers
   - Allowed to push: No one
   - Require approval: Yes

## Daily Git Workflow

### Starting a New Task

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...
```

### Committing Changes

```bash
# Stage changes
git add .

# Or stage specific files
git add src/components/NewComponent.tsx

# Commit with good message
git commit
# (Template will open in your editor)

# Or commit directly
git commit -m "feat(funnels): add webhook trigger support"
```

### Pushing Changes

```bash
# First time pushing a new branch
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

### Creating Pull Request

1. Go to repository on GitHub/GitLab/Bitbucket
2. Click "New Pull Request" or "Create Merge Request"
3. Fill in:
   - **Title**: Clear, descriptive title
   - **Description**: What changed and why
   - **Reviewers**: Add team members
   - **Labels**: Add appropriate labels
4. Submit for review

### After PR is Merged

```bash
# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Delete local feature branch
git branch -d feature/your-feature-name

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/your-feature-name
```

## Git Best Practices

### 1. Commit Often

- Small, focused commits
- Each commit should be a logical unit
- Easier to review and revert

### 2. Write Good Commit Messages

```bash
# Good
feat(categories): add color picker component
fix(api): handle null response from categories endpoint
docs: update setup instructions in README

# Bad
updated stuff
fix bug
changes
```

### 3. Keep Branches Up to Date

```bash
# Regularly merge main into your feature branch
git checkout feature/your-feature
git merge main

# Or rebase (cleaner history, but more advanced)
git rebase main
```

### 4. Review Before Pushing

```bash
# Check what you're about to commit
git status
git diff

# Review staged changes
git diff --staged

# Check commit history
git log --oneline
```

### 5. Don't Commit Sensitive Data

Never commit:
- API keys or secrets
- Passwords
- Personal information
- Environment files with real credentials

If you accidentally commit sensitive data:

```bash
# Remove file from Git but keep locally
git rm --cached .env
git commit -m "chore: remove .env from git"
git push

# If already pushed, rotate the exposed secrets immediately!
```

## Team Collaboration

### Setting Up Team Members

1. Add collaborators to repository
2. Share documentation:
   - `QUICKSTART.md` - For getting started
   - `CONTRIBUTING.md` - For contributing
   - `README.md` - For overview
3. Set up team communication channel
4. Establish code review process

### Code Review Guidelines

**For Authors:**
- Write clear PR description
- Keep PRs small and focused
- Respond to feedback promptly
- Test before requesting review

**For Reviewers:**
- Be constructive and kind
- Ask questions, don't demand changes
- Approve when ready
- Provide actionable feedback

## Useful Git Commands

```bash
# View current status
git status

# View commit history
git log --oneline --graph

# View changes in a commit
git show <commit-hash>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo local changes to a file
git checkout -- <file>

# View all branches
git branch -a

# Delete local branch
git branch -d branch-name

# View remote repository info
git remote -v

# Fetch latest from remote without merging
git fetch origin

# View differences between branches
git diff main..feature-branch

# Stash changes temporarily
git stash
git stash pop

# Cherry-pick a commit from another branch
git cherry-pick <commit-hash>

# View who changed what in a file
git blame <file>
```

## Troubleshooting

### Merge Conflicts

```bash
# If you get a merge conflict
git status  # Shows conflicted files

# Open conflicted files and resolve
# Look for markers: <<<<<<<, =======, >>>>>>>

# After resolving
git add <resolved-files>
git commit
```

### Accidentally Committed to Wrong Branch

```bash
# If you committed to main instead of feature branch
git checkout main
git log  # Note the commit hash you want to move

git checkout -b feature/correct-branch
git cherry-pick <commit-hash>

git checkout main
git reset --hard HEAD~1  # Remove commit from main
```

### Need to Update PR After Review

```bash
# Make changes
git add .
git commit -m "refactor: address review feedback"
git push

# PR will automatically update
```

## Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com)
- [GitLab Documentation](https://docs.gitlab.com)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

## Git Configuration Tips

```bash
# Set your identity (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use better diff tool
git config --global diff.tool vscode

# Enable color output
git config --global color.ui auto

# Set default branch name to main
git config --global init.defaultBranch main

# Auto-correct typos
git config --global help.autocorrect 1

# Cache credentials for HTTPS (15 minutes)
git config --global credential.helper cache

# View all config
git config --list
```

## Ready to Share!

Your project is now ready to be shared with your team via Git. Make sure to:

1. ✅ Initialize Git repository
2. ✅ Set up remote (GitHub/GitLab/Bitbucket)
3. ✅ Push initial commit
4. ✅ Set up branch protection
5. ✅ Add team members as collaborators
6. ✅ Share documentation with team
7. ✅ Establish workflow and code review process

Happy collaborating!
