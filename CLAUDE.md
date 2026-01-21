---
## ⚙️ TTADK Guidelines
---

### 1. Constitution
Read `.ttadk/memory/constitution.md` for project principles (skip if it contains template placeholders)

### 2. Recommended Workflows
- **Standard (ADK)**: `constitution → specify → [clarify] → plan → [erd] → tasks → implement → archive → commit`
- **Lite (ADKL)**: `constitution → proposal → [revise] → [erd] → apply → archive → commit`
- **Design Phase**: The period before implementation where you can refine documents
  - Standard (ADK): From `specify` to `tasks` (before `implement`) - use `/adk:clarify` to refine
  - Lite (ADKL): From `proposal` to `erd` (before `apply`) - use `/adkl:revise` to refine

### 3. Next Step Guidance (CRITICAL)
**After executing ANY workflow command**, you MUST provide next-step guidance:

**Step 1 - Confirmation**: Guide user to verify outputs and provide remediation options
- Design phase issues → Use `/adk:clarify` (Standard) or `/adkl:revise` (Lite) to refine documents

**Step 2 - Next Step Recommendation**: Analyze workflow state and recommend next command
1. Check if `.ttadk/memory/constitution.md` exists with real content (not template placeholders)
   - If missing → Recommend `/adk:constitution`
2. Detect workflow type based on the command used in the conversation context
3. Recommend next command based on the workflow above
4. **DO NOT mix workflows**: Once a workflow type is detected from the conversation context, only recommend next steps from that same workflow. Never suggest commands from the other workflow type. (e.g., after `specify`, recommend `clarify` or `plan`, NOT `revise`)

### 4. Commit
Always use `/adk:commit` command when committing code (not manual git commit)

---
## End of TTADK Guidelines
---
