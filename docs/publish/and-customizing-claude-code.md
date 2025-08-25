# Customizing Claude Code: What I Learned from Losing Everything

Imagine that you've spent weeks building a set of custom Claude Code slash commands. Custom shortcuts that know your workflow, your coding standards, your deployment pipeline. Then one day they're just gone. Maybe you switched machines, maybe a config got corrupted, maybe you just forgot to version control them properly. 

That's what happened to me. I'd built numerous custom slash commands in Claude Code. `/xgit` ran my git workflows. `/xdocs` generated documentation. `/xsecurity` checked security requirements over and above deterministic tooling.

I learned later it was because I'd configured them for one of the projects I was no longer using. When I switched contexts, everything disappeared. I'd built customization without making it portable or persistent.

The irony wasn't lost on me—I've always been an advocate for version controlling everything in software development. But while learning Claude Code, I got lulled into treating these commands as disposable experiments rather than valuable assets. The ease of creating them made me forget their importance until they were gone.

So I rebuilt everything—but this time with a system designed to survive project switches and machine changes.

## Building Customizations That Last

What I learned: customization needs to be portable across projects, machines, and teams.

The toolkit is distributed as an NPM package, making installation straightforward and consistent across all platforms. If you want to see the full collection of examples and patterns, visit https://github.com/PaulDuvall/claude-code:

```bash
# 1. Install Claude Code (if you haven't already)
npm install -g @anthropic-ai/claude-code

# 2. Install Claude Dev Toolkit via NPM
npm install -g @paulduvall/claude-dev-toolkit

# 3. Deploy commands to Claude Code
claude-commands install --active # Install core commands

# 4. Install Claude Code subagents (Optional)
claude-commands subagents --install

# 5. Configure settings (Optional)
claude-commands config --list  # View available templates
claude-commands config --template <template-name>  # Apply your preferred template
# Learn more: https://docs.anthropic.com/en/docs/claude-code/settings
```

The toolkit handles deployment automatically, preventing the fragmentation that caused my original loss. The NPM package contains all commands, templates, and configuration files you need.

For those interested in exploring the source code or contributing:

```bash
# Optional: View source code and contribute
git clone https://github.com/PaulDuvall/claude-code.git
```

The NPM package is completely self-contained, so you can install, configure, and customize Claude Code without needing the repository.

Real persistence comes from `CLAUDE.md` - Claude Code's reference guide for your project. This file is what makes customization truly portable. When I lost my commands, I also lost all the context about why they existed and how to use them. The [CLAUDE.md](https://www.anthropic.com/engineering/claude-code-best-practices) structure captures core philosophy, command categories, and development guidelines.  

## Advanced Features Deep Dive

### Custom Commands

Here's something I learned: custom slash commands work best when deterministic tooling won't cut it—when you need AI's judgment, creativity, or pattern recognition. I didn't always follow this rule when creating my custom slash commands. Some, like `/xtest`, could arguably be simple shell scripts. But the real power comes when AI enhances the tooling.

Take `/xdebug` or `/xarchitecture`—these leverage AI to analyze patterns, suggest improvements, and make decisions that pure scripts cannot. The magic happens when agents combine deterministic tools (running tests, checking syntax) with AI reasoning (understanding context, making architectural decisions, generating creative solutions).

Custom slash commands are markdown files stored in:
- Machine-wide: `~/.claude/commands/`
- Project-specific: `.claude/commands/`

Each command is a markdown file with name, description, and system prompt. For more details, see the [slash commands documentation](https://docs.anthropic.com/en/docs/claude-code/slash-commands).

The custom slash commands in the toolkit are markdown files that define custom behaviors. The "x" prefix is my convention for custom commands.

My core/active custom slash commands evolved from real needs:
- `/xtest`, `/xquality`, `/xgit` - Daily development workflow
- `/xsecurity`, `/xrefactor` - Code improvement and safety
- `/xdebug`, `/xarchitecture` - Complex problem-solving that needs AI insight
- `/xspec`, `/xdocs` - Documentation and requirements
- `/xpipeline`, `/xrelease`, `/xconfig` - CI/CD automation

Creating custom commands is straightforward: write markdown files in `.claude/commands/` and they become available automatically. The real value emerges when you chain them:

```bash
/xtest       # Run tests with coverage
/xsecurity   # Scan for vulnerabilities  
/xquality    # Check code quality
/xgit        # Commit and push with AI-generated message
```

This workflow replaces dozens of manual steps with four commands. Always version control your `.claude/` directory—it's your customization insurance policy.

### Hooks: Intercepting Claude Code's Operations

Hooks are shell scripts that intercept Claude Code's operations. They trigger on events like `UserPromptSubmit` (when you send a message), `PreToolUse` (before Claude Code runs commands), `PostToolUse` (after file edits), and `SessionStart` (when starting Claude Code). Store them in:
- Machine-wide: `~/.claude/hooks/`
- Project-specific: `.claude/hooks/`

The toolkit includes [hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) and [subagents](https://docs.anthropic.com/en/docs/claude-code/subagents) that work together. Hooks intercept operations while subagents provide AI-powered analysis and decision-making. This combination creates a powerful workflow where deterministic controls (hooks) trigger intelligent responses (subagents) that don't rely on AI remembering to check for issues—they enforce it every time.

## Start Building

1. Install with `npm install -g @paulduvall/claude-dev-toolkit`
2. Deploy commands with `claude-commands install --active`
3. Create `CLAUDE.md` with project context
4. Build custom commands in `.claude/commands/`
5. Install [Subagents](https://docs.anthropic.com/en/docs/claude-code/subagents) for persistent context: `claude-commands subagents --install`
6. Version control everything

Some of my customizations were inspired by my patterns at https://github.com/PaulDuvall/ai-development-patterns. 

I never want to lose my customizations again. That's why everything lives in version control now—portable across projects, machines, and teams. When you build your system, remember: customization lets you focus on architecture and problem-solving, but only if it survives. Start small, build systematically, version control everything.

## Dive Deeper

For advanced techniques and more detailed examples of commands, configuration, and hooks, see my post: [Claude Code Advanced Tips: Using Commands, Configuration, and Hooks](https://www.paulmduvall.com/claude-code-advanced-tips-using-commands-configuration-and-hooks/).