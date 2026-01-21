---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync

---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

If the given `$ARGUMENTS` contains a link, you need to read the content of the link (use lark-docs mcp if it's a lark doc) and replace the link with content.

## Context
**Read context before Executing**:
1. Language Setting
   - Read `preferred_language` from `.ttadk/config.yaml` (default: 'en' if missing). **IMPORTANT** **Use the configured language for ALL outputs: 'en' → English, 'zh' → 中文. This applies to: generated documents (specs, plans, tasks), interactive prompts, confirmations, status messages, and error descriptions.**

2. Reference & Context Setup (CRITICAL - EXECUTE FIRST)
    - **PHASE 1: FORCE CONTEXT REFRESH**
        - **Assumption**: The existing `AGENT.md` (or `CLAUDE.md`) is considered **STALE** (outdated).
        - **Mandatory Action**: You MUST execute the **slash command `/init `** immediately to analyzing this codebase.
        - **Blocker**: Do NOT read or analyze the code structure until `/init` has successfully finished. If you can not find /init, block and get help from user
    - **PHASE 2: ARCHITECTURE ALIGNMENT**
        - **Read**: After `/init` completes, read the newly generated `AGENT.md` (or `CLAUDE.md`).
        - **Summarize**: Clarify the technical framework based **strictly** on this new file.
        - **Constraint**: Do not hallucinate architecture. If it conflicts with your training data, the `AGENT.md` (or `CLAUDE.md`) truth prevails.
    - **PHASE 3: LOAD EXTERNAL STACK**
        - **Execute**: Run `node .ttadk/scripts/get-stack-context.js json`.
        - **Process**: Parse the JSON output.
            - *Trigger*: If a Lark/Feishu URL is present, use `lark-doc mcp` to fetch its content.
        - **Index**: Build your working memory index based on these references.

## Outline

You are updating the project constitution at `.ttadk/memory/constitution.md`. This file is a TEMPLATE containing placeholder tokens in square brackets (e.g. `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Your job is to (a) collect/derive concrete values, (b) fill the template precisely, and (c) propagate any amendments across dependent artifacts.

Follow this execution flow:

1. Load the existing constitution template at `.ttadk/memory/constitution.md`.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
     **IMPORTANT**: The user might require less or more principles than the ones used in the template. If a number is specified, respect that - follow the general template. You will update the doc accordingly.

2. Collect/derive values for placeholders:
   - If user input (conversation) supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, prior constitution versions if embedded).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown ask or mark TODO), `LAST_AMENDED_DATE` is today if changes are made, otherwise keep previous.
   - `CONSTITUTION_VERSION` must increment according to semantic versioning rules:
     - MAJOR: Backward incompatible governance/principle removals or redefinitions.
     - MINOR: New principle/section added or materially expanded guidance.
     - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
   - If version bump type ambiguous, propose reasoning before finalizing.

3. Draft the updated constitution content:
   - Replace every placeholder with concrete text (no bracketed tokens left except intentionally retained template slots that the project has chosen not to define yet—explicitly justify any left).
   - Preserve heading hierarchy and comments can be removed once replaced unless they still add clarifying guidance.
   - Ensure each Principle section: succinct name line, paragraph (or bullet list) capturing non‑negotiable rules, explicit rationale if not obvious.
   - Ensure Governance section lists amendment procedure, versioning policy, and compliance review expectations.
   - **IMPORTANT**: The `## Fixed Rules` section MUST be preserved - do NOT modify, remove, or replace any rules in this section. However, the language of these rules should match the document's overall language (translate if needed while keeping the same meaning).

4. Consistency propagation checklist (convert prior checklist into active validations):

   **Standard Workflow Templates:**
   - Read `.ttadk/templates/plan-template.md` and ensure any "Constitution Check" or rules align with updated principles.
   - Read `.ttadk/templates/spec-template.md` for scope/requirements alignment—update if constitution adds/removes mandatory sections or constraints.
   - Read `.ttadk/templates/tasks-template.md` and ensure task categorization reflects new or removed principle-driven task types (e.g., observability, versioning, testing discipline).

   **Lite Workflow Templates (streamlined versions for rapid iteration):**
   - Read `.ttadk/templates/plan-template-lite.md` and ensure simplified planning sections still capture core constitution principles without sacrificing governance essentials. Lite versions prioritize speed while maintaining alignment with mandatory principles.
   - Read `.ttadk/templates/spec-template-lite.md` for lightweight requirements capture—verify that even abbreviated sections preserve non-negotiable constraints defined in constitution (e.g., security, compliance, quality gates).
   - Read `.ttadk/templates/tasks-template-lite.md` and confirm streamlined task breakdown still reflects principle-driven categories (e.g., must-have testing, observability hooks) even when detailed decomposition is deferred to implementation phase.

   **Command Definitions and Documentation:**
   - Read each command file in `.ttadk/templates/commands/*.md` (including this one) to verify no outdated references (agent-specific names like CLAUDE only) remain when generic guidance is required.
   - Read any runtime guidance docs (e.g., `README.md`, `docs/quickstart.md`, or agent-specific guidance files if present). Update references to principles changed.

5. Produce a Sync Impact Report (prepend as an HTML comment at top of the constitution file after update):
   - Version change: old → new
   - List of modified principles (old title → new title if renamed)
   - Added sections
   - Removed sections
   - Templates requiring updates (✅ updated / ⚠ pending) with file paths
   - Follow-up TODOs if any placeholders intentionally deferred.

6. Validation before final output:
   - No remaining unexplained bracket tokens.
   - Version line matches report.
   - Dates ISO format YYYY-MM-DD.
   - Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

7. Write the completed constitution back to `.ttadk/memory/constitution.md` (overwrite).

8. Output a final summary to the user with:
   - New version and bump rationale.
   - Any files flagged for manual follow-up.
   - Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).

Formatting & Style Requirements:

- Use Markdown headings exactly as in the template (do not demote/promote levels).
- Wrap long rationale lines to keep readability (<100 chars ideally) but do not hard enforce with awkward breaks.
- Keep a single blank line between sections.
- Avoid trailing whitespace.

If the user supplies partial updates (e.g., only one principle revision), still perform validation and version decision steps.

If critical info missing (e.g., ratification date truly unknown), insert `TODO(<FIELD_NAME>): explanation` and include in the Sync Impact Report under deferred items.

Do not create a new template; always operate on the existing `.ttadk/memory/constitution.md` file.