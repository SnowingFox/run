#!/usr/bin/env node
"use strict";
/**
 * Get Stack Context Script
 *
 * Reads stack configuration and references from cache for AI commands.
 * Uses ONLY Node.js native APIs (no external dependencies).
 * Feature 011: Tech Stack Enhancement Support System - User Story 3
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Get repo root directory
 */
function getRepoRoot() {
    let currentDir = process.cwd();
    while (currentDir !== '/') {
        if (fs.existsSync(path.join(currentDir, '.ttadk'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    throw new Error('Not in a TTADK project (no .ttadk directory found)');
}
/**
 * Load dependency cache
 */
function loadCache(projectRoot) {
    const cachePath = path.join(projectRoot, '.ttadk', '.stack-cache.json');
    if (!fs.existsSync(cachePath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(cachePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return null;
    }
}
/**
 * Check if cache is stale
 * Uses a tolerance of 2 seconds to avoid false positives during init
 * (file copy and cache save happen almost simultaneously)
 */
function isCacheStale(projectRoot, cache) {
    if (!cache || !cache.lastUpdated) {
        return true;
    }
    const cacheTime = new Date(cache.lastUpdated).getTime();
    const TOLERANCE_MS = 2000; // 2 seconds tolerance
    // Check base.yaml
    const baseYamlPath = path.join(projectRoot, '.ttadk', 'stacks', 'base.yaml');
    if (fs.existsSync(baseYamlPath)) {
        const baseTime = fs.statSync(baseYamlPath).mtimeMs;
        if (baseTime > cacheTime + TOLERANCE_MS) {
            return true;
        }
    }
    // Check stack YAML
    const stackYamlPath = path.join(projectRoot, '.ttadk', 'stacks', cache.selectedStack, `${cache.selectedStack}.yaml`);
    if (fs.existsSync(stackYamlPath)) {
        const stackTime = fs.statSync(stackYamlPath).mtimeMs;
        if (stackTime > cacheTime + TOLERANCE_MS) {
            return true;
        }
    }
    return false;
}
/**
 * Get references text for AI context (supports all stacks)
 */
function getReferencesText(cache, projectRoot) {
    if (!cache || !cache.stacks) {
        return '';
    }
    const lines = [];
    lines.push('# Available Technical References (All Stacks)');
    lines.push('');
    lines.push('The following reference documents are available across all tech stacks:');
    lines.push('');
    // Collect all references from all stacks, organized by stack
    let totalRefCount = 0;
    for (const [stackName, stackConfig] of Object.entries(cache.stacks)) {
        if (stackConfig.references && stackConfig.references.length > 0) {
            lines.push(`## ${stackConfig.display_name || stackName}`);
            lines.push('');
            for (const ref of stackConfig.references) {
                totalRefCount++;
                lines.push(`${totalRefCount}. **${ref.description}**`);
                // Handle both file_path and web_url references
                if (ref.web_url) {
                    lines.push(`   Type: Web Reference`);
                    lines.push(`   URL: ${ref.web_url}`);
                    lines.push(`   (Use WebFetch or lark-docs MCP to retrieve content)`);
                }
                else if (ref.file_path) {
                    // Try to read the reference file content
                    const refPath = path.join(projectRoot, '.ttadk', 'stacks', path.basename(ref.file_path));
                    if (fs.existsSync(refPath)) {
                        try {
                            const content = fs.readFileSync(refPath, 'utf-8');
                            // Include first 300 chars as preview
                            const preview = content.substring(0, 300).trim();
                            lines.push(`   Type: Local File`);
                            lines.push(`   Location: ${refPath}`);
                            lines.push(`   Preview: ${preview}...`);
                        }
                        catch (error) {
                            lines.push(`   Type: Local File`);
                            lines.push(`   Location: ${refPath} (could not read)`);
                        }
                    }
                }
                lines.push('');
            }
        }
    }
    if (totalRefCount === 0) {
        lines.push('(No references available)');
    }
    return lines.join('\n');
}
/**
 * Get stack info text (supports all stacks)
 */
function getStackInfoText(cache) {
    if (!cache || !cache.stacks) {
        return 'No stack information available.';
    }
    const lines = [];
    lines.push('# All Available Stacks');
    lines.push('');
    lines.push(`**AI Tool**: ${cache.aiTool}`);
    lines.push(`**Injection Mode**: All Stacks`);
    lines.push('');
    // List all stacks with their resources
    let totalCommands = 0;
    let totalMcps = 0;
    let totalSubagents = 0;
    let totalReferences = 0;
    for (const [stackName, stackConfig] of Object.entries(cache.stacks)) {
        if (stackName === 'base')
            continue; // Skip base, show only actual stacks
        lines.push(`## ${stackConfig.display_name || stackConfig.name}`);
        lines.push('');
        lines.push(`**Description**: ${stackConfig.description || 'No description available'}`);
        lines.push(`**Stack Type**: ${stackConfig.type}`);
        lines.push('');
        lines.push('**Available Resources**:');
        const commands = stackConfig.commands?.length || 0;
        const mcps = stackConfig.mcps?.length || 0;
        const subagents = stackConfig.subagents?.length || 0;
        const references = stackConfig.references?.length || 0;
        lines.push(`- Commands: ${commands}`);
        lines.push(`- MCPs: ${mcps}`);
        lines.push(`- Subagents: ${subagents}`);
        lines.push(`- References: ${references}`);
        lines.push('');
        totalCommands += commands;
        totalMcps += mcps;
        totalSubagents += subagents;
        totalReferences += references;
    }
    lines.push('---');
    lines.push('');
    lines.push('**Total Resources Across All Stacks**:');
    lines.push(`- Commands: ${totalCommands}`);
    lines.push(`- MCPs: ${totalMcps}`);
    lines.push(`- Subagents: ${totalSubagents}`);
    lines.push(`- References: ${totalReferences}`);
    return lines.join('\n');
}
/**
 * Main execution
 */
async function main() {
    try {
        const args = process.argv.slice(2);
        const command = args[0] || 'info';
        // Get project root
        const projectRoot = getRepoRoot();
        // Load cache
        const cache = loadCache(projectRoot);
        if (!cache) {
            console.error('WARNING: No stack cache found. Run "ttadk init" or "ttadk update" first.');
            process.exit(0);
        }
        // Check if cache is stale
        const isStale = isCacheStale(projectRoot, cache);
        if (isStale) {
            console.error('WARNING: Stack cache is stale. Run "ttadk update" to refresh.');
            console.error('');
        }
        // Execute command
        switch (command) {
            case 'info':
                console.log(getStackInfoText(cache));
                break;
            case 'references':
                console.log(getReferencesText(cache, projectRoot));
                break;
            case 'json':
                console.log(JSON.stringify(cache, null, 2));
                break;
            default:
                console.error(`Unknown command: ${command}`);
                console.error('Usage: node .ttadk/scripts/get-stack-context.js [info|references|json]');
                process.exit(1);
        }
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
// Only run if executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}
//# sourceMappingURL=get-stack-context.js.map