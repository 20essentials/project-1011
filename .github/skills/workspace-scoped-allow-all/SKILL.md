---
name: workspace-scoped-allow-all
description: Configure Copilot CLI to auto-approve tools while sandboxing shell commands to the active project folder. Use when asked to enable allow-all behavior limited to one workspace.
---

# Workspace-scoped tool approvals

Configure Copilot CLI to reduce tool approval prompts without disabling path verification or granting unrestricted filesystem access.

## Rules

- Never use `/allow-all`, `/permissions allow-all`, `--allow-all`, or `--yolo`. These enable path access beyond the active workspace.
- Use `--allow-all-tools` when launching a new Copilot CLI session. This approves tool calls without enabling the allow-all-paths or allow-all-urls flags. If the current session was not launched with this flag, explain that the user must start a new session to use it.
- Enable the command sandbox and automatically grant read/write access to the active working directory.
- Treat `~/.copilot/settings.json` as user-wide configuration. Before changing it, explain that sandbox settings apply across projects and get approval. Preserve existing settings and merge only the required keys.
- Set these sandbox values when approved:

  ```json
  {
    "sandbox": {
      "enabled": true,
      "addCurrentWorkingDirectory": true,
      "allowDevToolAccess": false
    }
  }
  ```

- Do not replace the full settings file or overwrite existing sandbox policies. Inspect and preserve other settings, including filesystem and network policies.
- If the user needs the setup only for one session, prefer the `/sandbox enable` session option and `--allow-all-tools` on the CLI launch rather than making persistent user-level changes, if available in the current CLI.
- Do not grant the home directory, parent folders, or broad tool/cache paths as a workaround. If disabling `allowDevToolAccess` prevents Node or pnpm from running, identify the exact required runtime/cache path and ask before adding a narrow grant.

## Explain the limits

- The sandbox applies OS-level restrictions to shell commands. Copilot's built-in file-edit tools follow the same filesystem policy on a best-effort basis, not as an OS-level boundary.
- Temporary storage, session logs, system locations, and other explicitly configured grants follow their own rules and may remain accessible.
- `allowDevToolAccess: false` disables automatic grants for developer tools, caches, and toolchains; some commands may need narrowly scoped access to their exact paths.
- `--allow-all-tools` does not mean all network access is allowed. Do not enable all URLs unless explicitly requested.
- Organization policy and operating-system permissions can still restrict actions or require approval.

## Verify

- Check sandbox status and the expanded filesystem policy with `/sandbox` and `/sandbox policy`.
- Confirm the active working directory is writable and no parent or home directory was added as a writable grant.
- If the active CLI session lacks `--allow-all-tools`, do not claim that all tools are auto-approved; explain that the next session must be launched with that flag.
