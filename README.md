# Claude Code Custom Commands

This repository contains custom slash commands for Claude Code.

## Commands

- **`/acp`** - Add, Commit, Push workflow with Conventional Commits format
- **`/refactor`** - Interactive code refactoring assistant with smell detection and suggestions

## Deployment

Deploy commands locally to your Claude Code installation:

```bash
./deploy.sh
```

This copies all `.md` files from `claude-commands/` to `~/.claude/commands/`, making them available as slash commands in Claude Code.

## Development

1. Add new command specifications as `.md` files in the `claude-commands/` directory
2. Run `./deploy.sh` to install them locally
3. Test the commands in Claude Code
4. Commit and push changes to share with others