#!/usr/bin/env python3
"""PreToolUse hook: verify GPG/SSH commit signing before git commit.

Reads a PreToolUse JSON event from stdin. If the Bash command is a
git commit, verifies that commit signing is configured. Blocks with
remediation instructions if not.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys

_GIT_COMMIT_RE = re.compile(r"\bgit\s+commit\b")


def _is_git_commit(command: str) -> bool:
    """Return True if command contains a git commit invocation."""
    return bool(_GIT_COMMIT_RE.search(command))


def _git_config(key: str) -> str:
    """Read a git config value, returning empty string on failure."""
    try:
        result = subprocess.run(
            ["git", "config", "--get", key],
            capture_output=True, text=True, timeout=5,
        )
        return result.stdout.strip()
    except (subprocess.SubprocessError, OSError):
        return ""


def _check_gpg_signing() -> str | None:
    """Verify GPG signing config. Return error message or None."""
    gpg_format = _git_config("gpg.format")
    if gpg_format == "ssh":
        return _check_ssh_signing()
    program = _git_config("gpg.program")
    if not program:
        return "gpg.program is not configured"
    return None


def _check_ssh_signing() -> str | None:
    """Verify SSH signing config. Return error message or None."""
    allowed = _git_config("gpg.ssh.allowedSignersFile")
    if not allowed:
        return "gpg.ssh.allowedSignersFile is not configured"
    return None


_REMEDIATION_TEMPLATE = """\
Commit signing is not properly configured: {error}

IMPORTANT: Ask the user which option they prefer before proceeding.

**Option 1 -- GPG signing** (traditional, widely supported):
```
git config --global commit.gpgsign true
git config --global gpg.program gpg
```
Requires: GPG installed, a GPG key generated (`gpg --gen-key`)

**Option 2 -- SSH signing** (simpler, uses existing SSH keys):

Step 1 -- Generate an SSH key (skip if ~/.ssh/id_ed25519.pub exists):
```
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Step 2 -- Configure git to use SSH signing:
```
git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
```

Step 3 -- Create the allowed signers file:
```
echo "$(git config --get user.email) namespaces=\\"git\\" $(cat ~/.ssh/id_ed25519.pub)" > ~/.ssh/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

Step 4 -- Add the key to GitHub as a **signing key**:
```
gh ssh-key add ~/.ssh/id_ed25519.pub --type signing
```
(Or manually: GitHub -> Settings -> SSH and GPG keys -> New SSH key -> \
Key type: **Signing Key**)

Ask the user: "Commit signing isn't configured. Would you like me to \
set it up for you? I can configure GPG or SSH signing -- which do you \
prefer?" Then run the commands for their chosen option.\
"""


def _build_remediation(error: str) -> str:
    """Build a user-friendly remediation message."""
    return _REMEDIATION_TEMPLATE.format(error=error)


def main() -> None:
    """Entry point: check commit signing config before git commit."""
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)
    command = event.get("tool_input", {}).get("command", "")
    if not _is_git_commit(command):
        sys.exit(0)
    gpgsign = _git_config("commit.gpgsign")
    if gpgsign != "true":
        reason = _build_remediation("commit.gpgsign is not enabled")
        print(json.dumps({"decision": "block", "reason": reason}))
        sys.exit(0)
    error = _check_gpg_signing()
    if error:
        reason = _build_remediation(error)
        print(json.dumps({"decision": "block", "reason": reason}))
    sys.exit(0)


if __name__ == "__main__":
    main()
