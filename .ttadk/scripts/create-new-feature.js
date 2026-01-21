#!/usr/bin/env node
"use strict";
/**
 * Create New Feature Script
 * Uses only Node.js built-in modules (no external dependencies)
 *
 * Sets up feature directory and copies spec.md from template
 * for the current git branch.
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
exports.createNewFeature = createNewFeature;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const common_1 = require("./common");
/**
 * Recursively scan directory for sequence numbers in filenames/foldernames
 * Pattern: 3-digit number at start of name (folder or file)
 * Note: Kept for compatibility but not used in current flow
 */
function findMaxSequenceNumber(dirPath) {
    let maxNum = 0;
    if (!(0, common_1.existsSync)(dirPath) || !(0, common_1.isDirSync)(dirPath)) {
        return maxNum;
    }
    try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            // Check if item matches pattern: 3-digit number followed by hyphen or dot
            const match = item.match(/^(\d{3})[-.]/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) {
                    maxNum = num;
                }
            }
            // Recursively scan subdirectories (but skip .git and other hidden dirs)
            if ((0, common_1.isDirSync)(fullPath) && !item.startsWith('.')) {
                const subMax = findMaxSequenceNumber(fullPath);
                if (subMax > maxNum) {
                    maxNum = subMax;
                }
            }
        }
    }
    catch (error) {
        console.warn(`[ttadk] Warning: Could not scan directory ${dirPath}: ${error}`);
    }
    return maxNum;
}
/**
 * Validate branch name format: 001-part1-part2-part3 (3-digit number + exactly 3 hyphen-separated parts)
 * Also validates 3-part name without prefix: part1-part2-part3
 * Note: Kept for compatibility but not used in current flow
 */
function validateBranchName(branchName) {
    const pattern = /^(\d{3}-)?[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;
    return pattern.test(branchName);
}
/**
 * Extract feature number from branch name
 * Note: Kept for compatibility
 */
function extractFeatureNumber(branchName) {
    const match = branchName.match(/^(\d{3})-/);
    return match ? match[1] : '';
}
/**
 * Extract the 3-part name from branch name (remove sequence prefix if present)
 * Note: Kept for compatibility but not used in current flow
 */
function extractThreePartName(branchName) {
    return branchName.replace(/^\d{3}-/, '');
}
// Suppress unused variable warnings
void findMaxSequenceNumber;
void validateBranchName;
void extractThreePartName;
async function createNewFeature(_featureDescription, _options = {}) {
    const repoRoot = (0, common_1.getRepoRoot)();
    const specsDir = path.join(repoRoot, 'specs');
    console.log(`[ttadk] Debug: Repository root: ${repoRoot}`);
    console.log(`[ttadk] Debug: Specs directory: ${specsDir}`);
    // Ensure specs directory exists
    if (!(0, common_1.existsSync)(specsDir)) {
        console.log(`[ttadk] Debug: Creating specs directory: ${specsDir}`);
        fs.mkdirSync(specsDir, { recursive: true });
    }
    // Get current branch (defaults to 'master' if no branch)
    const branchName = (0, common_1.getCurrentBranch)();
    console.log(`[ttadk] Debug: Current branch: ${branchName}`);
    // Extract feature number if exists (for compatibility)
    const featureNum = extractFeatureNumber(branchName) || '000';
    // Create feature directory (supports nested paths like feat/update-1-1)
    const featureDir = path.join(specsDir, branchName);
    if (!(0, common_1.existsSync)(featureDir)) {
        fs.mkdirSync(featureDir, { recursive: true });
        console.log(`[ttadk] Debug: Created feature directory: ${featureDir}`);
    }
    // Copy spec template
    const template = path.join(repoRoot, '.ttadk', 'templates', 'spec-template.md');
    const specFile = path.join(featureDir, 'spec.md');
    if ((0, common_1.existsSync)(template)) {
        const content = fs.readFileSync(template, 'utf-8');
        fs.writeFileSync(specFile, content, 'utf-8');
        console.log(`[ttadk] Debug: Copied template to ${specFile}`);
    }
    else {
        fs.writeFileSync(specFile, '# Feature Specification\n\nTODO: Fill in feature details\n', 'utf-8');
        console.log(`[ttadk] Warning: Template not found, using fallback content`);
    }
    // Set the TTADK_FEATURE environment variable for the current session
    process.env.TTADK_FEATURE = branchName;
    console.log(`[ttadk] Debug: Branch: ${branchName}`);
    console.log(`[ttadk] Debug: Created spec file: ${specFile}`);
    return {
        BRANCH_NAME: branchName,
        FEATURE_DIR: featureDir,
        SPEC_FILE: specFile,
        FEATURE_NUM: featureNum,
    };
}
// CLI mode
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        json: args.includes('--json'),
    };
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`Usage: create-new-feature [--json]`);
        console.log(`  --json    Output JSON format`);
        console.log(``);
        console.log(`This script:`);
        console.log(`  1. Gets the current git branch (defaults to 'master' if none)`);
        console.log(`  2. Creates specs/{branch}/ directory`);
        console.log(`  3. Copies spec.md template to the directory`);
        process.exit(0);
    }
    createNewFeature(undefined, options)
        .then(result => {
        if (options.json) {
            console.log(JSON.stringify(result));
        }
        else {
            console.log(`BRANCH_NAME: ${result.BRANCH_NAME}`);
            console.log(`FEATURE_DIR: ${result.FEATURE_DIR}`);
            console.log(`SPEC_FILE: ${result.SPEC_FILE}`);
            console.log(`FEATURE_NUM: ${result.FEATURE_NUM}`);
        }
        process.exit(0);
    })
        .catch(error => {
        console.error(`ERROR: ${error.message}`);
        process.exit(1);
    });
}
//# sourceMappingURL=create-new-feature.js.map