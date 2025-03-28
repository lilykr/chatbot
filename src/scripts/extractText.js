const fs = require('node:fs');
const path = require('node:path');
const glob = require('glob');
const babel = require('@babel/core');
const generate = require('@babel/generator').default;

// Directories to scan
const SRC_DIR = path.resolve(__dirname, '../');
const EXCLUDE_DIRS = ['node_modules', 'build', 'dist', 'scripts', 'i18n'];
const INCLUDE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

// Output file
const OUTPUT_FILE = path.resolve(__dirname, './extracted-strings.json');

// Store for extracted strings
const extractedStrings = {};
let stringCount = 0;

// Helper to convert text to a valid key
function textToKey(text) {
    // Generate a namespace based on the text content
    const namespace = 'app';

    // Convert to snake case and limit length
    const key = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 30);

    return `${namespace}.${key}`;
}

// Find all Text components and extract their content
function extractTextFromAST(ast, filePath) {
    const extractedFromFile = [];

    babel.traverse(ast, {
        // Extract from Text components
        JSXElement(path) {
            const openingElement = path.node.openingElement;
            if (
                openingElement.name.type === 'JSXIdentifier' &&
                (openingElement.name.name === 'Text')
            ) {
                // Extract text content if it's a string literal
                const children = path.node.children;
                for (const child of children) {
                    if (child.type === 'JSXText' && child.value.trim()) {
                        const text = child.value.trim();
                        const key = textToKey(text);

                        extractedStrings[key] = text;
                        extractedFromFile.push({ key, text });
                        stringCount++;
                    }
                }
            }
        },

        // Extract from string literals
        StringLiteral(path) {
            // Only extract strings that are likely UI text (skip imports, requires, file paths)
            const parent = path.parent;
            if (
                parent.type === 'JSXAttribute' &&
                ['title', 'label', 'placeholder', 'accessibilityLabel'].includes(parent.name.name)
            ) {
                const text = path.node.value.trim();
                if (text && text.length > 1) {
                    const key = textToKey(text);
                    extractedStrings[key] = text;
                    extractedFromFile.push({ key, text });
                    stringCount++;
                }
            }
        }
    });

    return extractedFromFile;
}

// Process a single file
function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Skip files that are already using i18n
        if (content.includes('useI18n') || content.includes('FormattedText')) {
            console.log(`Skipping ${filePath} - already using i18n`);
            return [];
        }

        const ast = babel.parseSync(content, {
            filename: filePath,
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
            plugins: ['@babel/plugin-syntax-jsx'],
        });

        return extractTextFromAST(ast, filePath);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return [];
    }
}

// Find all files to scan
function findFiles() {
    const pattern = `${SRC_DIR}/**/*+(${INCLUDE_EXTENSIONS.join('|')})`;
    const excludePattern = `${INCLUDE_EXTENSIONS.map(ext =>
        EXCLUDE_DIRS.map(dir => `**/node_modules/**/*${ext}`).join('|')
    ).join('|')}`;

    return glob.sync(pattern, { ignore: excludePattern });
}

// Main function
function main() {
    console.log('Starting text extraction...');

    const files = findFiles();
    console.log(`Found ${files.length} files to scan`);

    const fileResults = {};

    // Process each file
    for (const filePath of files) {
        const relativePath = path.relative(SRC_DIR, filePath);
        const extracted = processFile(filePath);

        if (extracted.length > 0) {
            fileResults[relativePath] = extracted;
            console.log(`Extracted ${extracted.length} strings from ${relativePath}`);
        }
    }

    // Write results to file
    const result = {
        statistics: {
            totalStrings: stringCount,
            totalFiles: Object.keys(fileResults).length,
        },
        strings: extractedStrings,
        fileMapping: fileResults
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`Extraction complete. Found ${stringCount} strings in ${Object.keys(fileResults).length} files.`);
    console.log(`Results saved to ${OUTPUT_FILE}`);
}

main(); 