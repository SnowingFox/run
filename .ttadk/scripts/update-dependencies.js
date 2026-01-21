#!/usr/bin/env node
"use strict";
/**
 * Update Dependencies Script
 *
 * CLI wrapper for updating stack dependencies.
 * Uses ONLY Node.js native APIs (no external dependencies).
 * Feature 011: Tech Stack Enhancement Support System - User Story 2
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
const update_js_1 = require("../commands/update.js");
/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    let projectRoot = process.cwd();
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--force':
                options.force = true;
                break;
            case '--json':
                options.format = 'json';
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
            default:
                // Assume it's the project root path
                if (!arg.startsWith('--')) {
                    projectRoot = path.resolve(arg);
                }
                break;
        }
    }
    return { projectRoot, options };
}
/**
 * Print help message
 */
function printHelp() {
    console.log(`
Usage: node .ttadk/scripts/update-dependencies.js [options] [project-root]

Options:
  --dry-run       Show what would be updated without making changes
  --force         Force update even if cache is not stale
  --json          Output results in JSON format
  --help, -h      Show this help message

Arguments:
  project-root    Path to project root (default: current directory)

Examples:
  node .ttadk/scripts/update-dependencies.js
  node .ttadk/scripts/update-dependencies.js --dry-run
  node .ttadk/scripts/update-dependencies.js --force --json
  node .ttadk/scripts/update-dependencies.js /path/to/project
`);
}
/**
 * Main execution
 */
async function main() {
    try {
        const { projectRoot, options } = parseArgs();
        // Verify project root exists
        if (!fs.existsSync(projectRoot)) {
            console.error(`Error: Project root does not exist: ${projectRoot}`);
            process.exit(1);
        }
        // Verify .ttadk directory exists
        const ttadkDir = path.join(projectRoot, '.ttadk');
        if (!fs.existsSync(ttadkDir)) {
            console.error(`Error: .ttadk directory not found in ${projectRoot}`);
            console.error('Have you run "ttadk init" yet?');
            process.exit(1);
        }
        // Run update
        const result = await (0, update_js_1.updateDependencies)(projectRoot, options);
        // Handle JSON output
        if (options.format === 'json') {
            console.log(JSON.stringify(result, null, 2));
        }
        // Exit with appropriate code
        if (!result.success) {
            process.exit(1);
        }
    }
    catch (error) {
        if (error.format === 'json') {
            console.error(JSON.stringify({ success: false, error: error.message }));
        }
        else {
            console.error('Error:', error.message);
        }
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
//# sourceMappingURL=update-dependencies.js.map