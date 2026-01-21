---
description: propose new features based on existing code and draft specifications/plans/task documents.

---

## User Input

```text
$ARGUMENTS
```
You **MUST** consider the user input before proceeding (if not empty).

If the given `$ARGUMENTS` contains a link, you need to read the content of the link. For lark/feishu doc URLs, export it via lark-docs MCP with `outputDir` set to `specs/` directory, then read the exported markdown content to understand the feature requirements.

## Phase

- ### **Phase 1: Context & Environment Setup**

  **Objective:** Gather all necessary context and configure the environment.

  1.  **Set Language:**
      - Read `.ttadk/config.yaml` to determine `preferred_language`.
      - Default to 'en' if the file or key is missing.
      - **Crucially, all subsequent outputs MUST be in this language.**
  2.  **Load Core Instructions:**
      - Read `.ttadk/memory/constitution.md`.
      - These are your guiding principles. Adhere to them strictly.
  3.  **Analyze User Request (`$ARGUMENTS`):**
      - If `$ARGUMENTS` contains a URL (e.g., a Lark document), fetch its full content and use that as the primary input.
      - Carefully parse the final text to understand the core feature requirements.
  4.  **Gather Project Context:**
      - Execute `node .ttadk/scripts/get-stack-context.js json` to get a JSON object of reference documents and URLs.
      - Refer to the description in the references section to quickly index the references you need.

  ---

  ### **Phase 2: Analysis & Planning**

  **Objective:** Bridge the user's request with the current state of the codebase.

  1.  **Initial Investigation:**
      - Use tools like `rg` and `ls` to explore the codebase related to the feature request.
      - **Goal:** Understand the current implementation, identify potential areas for modification, and note any knowledge gaps.

  2.  **Clarification (Interactive Step):**
      - **If the request is ambiguous, incomplete, or conflicts with existing code:**
          - Formulate specific, targeted questions for the user.
          - **Do not proceed until you receive clarification.** This prevents rework and ensures alignment.

  3.  **Check for Duplicates:**
      - Before creating new requirements, search for similar or overlapping features in the archive:
        `rg -n "ARCHIVE:|{feature-name-keyword}:" specs/archived`
      - If a similar feature exists, notify the user and ask whether to modify it or create a new one.

  ---

  ### **Phase 3: Document Generation**

  **Objective:** Create the feature specification, implementation plan, and task breakdown.

  1.  **Get Current Branch & Setup Files:**
      - Run `node .ttadk/scripts/create-new-feature-lite.js --json` from repo root.
      - This script gets the current branch, creates `specs/{branch}/` directory, and copies template files (spec.md, plan.md, tasks.md).
      - Parse the JSON output to get FEATURE_DIR and file paths.

  2.  **Draft Feature Specification (`spec.md`):**
      - Load the `spec.md`.
      - Translate the user's request (`$ARGUMENTS`) and your analysis into formal requirements.
      - Fill in all placeholders, ensuring the document is clear, precise, and directly addresses the user's goal. Maintain the original section order.
      - **If lark doc was exported**: When filling the `Input` field in spec.md, include both the original URL and the local file path. Calculate the correct relative path based on branch depth:
        - For simple branch (e.g., `main`): `specs/main/spec.md` → `../doc_export/file.md`
        - For nested branch (e.g., `feat/xxx`): `specs/feat/xxx/spec.md` → `../../doc_export/file.md`
        - For deeper nesting (e.g., `feat/sub/xxx`): `specs/feat/sub/xxx/spec.md` → `../../../doc_export/file.md`
        - Example: `**Input**: https://bytedance.larkoffice.com/wiki/xxx (local copy: [filename.md](../../doc_export/file.md))`

  3.  **Draft Implementation Plan (`plan.md`):**
      - Load the `plan.md`.
      - Based on the `spec.md` and your codebase investigation, devise a concrete technical solution.
      - Detail the "how": specify which files to create/modify, what classes or functions to add, and any key technical decisions.
      - Adhere to the project's existing architecture and best practices.
      - **CRITICAL - Technical Context Section**:
        * Keep all field names in ENGLISH (Language/Version, Primary Dependencies, Storage, Testing, Target Platform, Project Type, Performance Goals, Constraints, Scale/Scope)
        * **REASON**: The update-agent-context.js script parses these English field names to extract tech stack information
        * **DO NOT translate field names** even if preferred_language is 'zh' - only translate the values/descriptions
        * Mark unknowns as "NEEDS CLARIFICATION"

  4.  **Draft Task Breakdown (`tasks.md`):**
      - Load the `tasks.md`.
      - Break down the implementation plan into a series of small, actionable development tasks.
      - Each task should be a logical, sequential step that a developer can pick up and complete. This must perfectly align with the User Stories defined in the plan.

  ---

  ### **Guiding Principles (Guardrails)**

  - **Simplicity First:** Always start with the most straightforward and minimal implementation. Avoid over-engineering.
  - **Scoped Changes:** Keep all proposed changes tightly focused on the requested feature. Do not introduce unrelated modifications.
  - **Respect Templates:** Preserve the section order and headings of all template files (`spec`, `plan`, `tasks`).
  - **URL Content Fetch**: Use lark-docs mcp to get a lark document content.
