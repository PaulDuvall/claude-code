<!-- File: claude-commands/acp.md -->
<!-- Purpose: Custom Claude Code slash‑command `/acp` that stages everything, generates a Conventional Commits message
     covering all changes since the last push, commits, and then pushes to the current branch's upstream. -->

# /acp — Add • Commit • Push with detailed description

## Objective
Automate a reliable "add → describe → commit → push" workflow so the project history stays readable and every push includes a Conventional Commits‑style message that accurately reflects all work since the previous push.

## Workflow
1. **Stage** every change in the working tree  
   ```bash
   git add .
   ```

2. **Inspect** what will be committed to craft an accurate message

   ```bash
   # File‑level summary
   git diff --cached --stat

   # Full staged diff (limit output for readability)
   git diff --cached --color=never | head -100

   # Context: commits not yet pushed (fallback if no upstream)
   git log --oneline --graph @{u}.. 2>/dev/null || git log --oneline -5
   ```

3. **Generate** a Conventional Commits message

   * **Summary line** (<50 chars) beginning with a type prefix:
     - `feat:` new functionality
     - `fix:` bug fixes  
     - `docs:` documentation changes
     - `refactor:` code restructuring
     - `test:` adding/updating tests
     - `chore:` maintenance tasks
   * Blank line.
   * **Bullet list** detailing each significant change (file/module → what changed & why).
   * Optional `BREAKING CHANGE:` paragraph if anything is backward‑incompatible.

4. **Commit** using that message

   ```bash
   git commit -m "<summary line>" -m "<bullet list details>"
   ```

5. **Push** the commit (and any tags created in the same session)

   ```bash
   # Push with upstream tracking if needed
   git push --follow-tags --set-upstream origin $(git branch --show-current) 2>/dev/null || git push --follow-tags
   ```

6. **Confirm** completion

   ```bash
   echo "✅ Pushed $(git rev-parse --short HEAD) to $(git branch --show-current) → $(git remote get-url --push origin)"
   ```

## Error handling

* Check for uncommitted changes before starting
* Verify upstream branch exists before pushing  
* Handle merge conflicts gracefully
* Provide clear error messages for common failure scenarios

## Expected output

* New commit hash
* Remote repository URL  
* Branch name
* Commit summary line
* Success confirmation with visual indicator