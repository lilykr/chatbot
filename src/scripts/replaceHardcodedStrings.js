const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Paths
const EXTRACTED_STRINGS_FILE = path.resolve(__dirname, './extracted-strings.json');
const BACKUP_DIR = path.resolve(__dirname, '../.translation-backups');

// Main function
async function main() {
    console.log('Replacing hardcoded strings in components...');

    // Load extracted strings
    if (!fs.existsSync(EXTRACTED_STRINGS_FILE)) {
        console.error(`Error: Extracted strings file not found at ${EXTRACTED_STRINGS_FILE}`);
        console.error('Please run the extractText.js script first');
        process.exit(1);
    }

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const extractedData = JSON.parse(fs.readFileSync(EXTRACTED_STRINGS_FILE, 'utf8'));
    const fileMapping = extractedData.fileMapping;

    // Process each file that contains extracted strings
    let totalReplacements = 0;
    for (const [filePath, extractedStrings] of Object.entries(fileMapping)) {
        const fullPath = path.resolve(__dirname, '../', filePath);

        if (!fs.existsSync(fullPath)) {
            console.warn(`Warning: File ${fullPath} not found, skipping`);
            continue;
        }

        // Create a backup of the original file
        const backupPath = path.resolve(BACKUP_DIR, path.basename(filePath));
        fs.copyFileSync(fullPath, backupPath);

        // Process the file
        console.log(`Processing ${filePath}...`);
        const replacementCount = await processFile(fullPath, extractedStrings);
        totalReplacements += replacementCount;
        console.log(`Completed ${filePath} with ${replacementCount} replacements`);
    }

    console.log(`Total replacements: ${totalReplacements}`);
    console.log('Hardcoded string replacement complete!');
    console.log(`Original files backed up to ${BACKUP_DIR}`);
}

// Process a single file
async function processFile(filePath, extractedStrings) {
    try {
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse the file using Babel
        const ast = babel.parseSync(content, {
            filename: filePath,
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
            plugins: ['@babel/plugin-syntax-jsx'],
        });

        let replacementCount = 0;
        const stringToKeyMap = extractedStrings.reduce((map, item) => {
            map[item.text] = item.key;
            return map;
        }, {});

        // Add necessary imports
        babel.traverse(ast, {
            Program(path) {
                // Check if FormattedText is already imported
                let hasFormattedTextImport = false;
                let hasI18nImport = false;

                for (const node of path.node.body) {
                    if (t.isImportDeclaration(node)) {
                        // Check for FormattedText import
                        if (node.source.value.includes('i18n/FormattedText')) {
                            hasFormattedTextImport = true;
                        }

                        // Check for useI18n import
                        if (node.source.value.includes('i18n/i18n') &&
                            node.specifiers.some(spec =>
                                t.isImportSpecifier(spec) && spec.imported.name === 'useI18n')) {
                            hasI18nImport = true;
                        }
                    }
                }

                // Add missing imports
                if (!hasFormattedTextImport) {
                    const formattedTextImport = t.importDeclaration(
                        [t.importDefaultSpecifier(t.identifier('FormattedText'))],
                        t.stringLiteral('../i18n/FormattedText')
                    );
                    path.node.body.unshift(formattedTextImport);
                }

                if (!hasI18nImport) {
                    const i18nImport = t.importDeclaration(
                        [t.importSpecifier(t.identifier('useI18n'), t.identifier('useI18n'))],
                        t.stringLiteral('../i18n/i18n')
                    );
                    path.node.body.unshift(i18nImport);
                }
            }
        });

        // Add t function to component if needed
        babel.traverse(ast, {
            FunctionDeclaration(path) {
                addI18nHookToComponent(path);
            },
            FunctionExpression(path) {
                addI18nHookToComponent(path);
            },
            ArrowFunctionExpression(path) {
                // Only process top-level components
                if (t.isVariableDeclarator(path.parent) && t.isReactComponent(path)) {
                    addI18nHookToComponent(path);
                }
            }
        });

        // Replace Text components with FormattedText
        babel.traverse(ast, {
            JSXElement(path) {
                const openingElement = path.node.openingElement;
                if (
                    openingElement.name.type === 'JSXIdentifier' &&
                    openingElement.name.name === 'Text'
                ) {
                    const children = path.node.children;

                    // Look for text nodes to replace
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        if (child.type === 'JSXText' && child.value.trim()) {
                            const text = child.value.trim();
                            if (stringToKeyMap[text]) {
                                // Replace with FormattedText
                                replacementCount++;
                                replaceTextWithFormattedText(path, text, stringToKeyMap[text]);
                                // Break after replacement because the AST structure will change
                                break;
                            }
                        }
                    }
                }
            },

            // Replace string literals in props
            StringLiteral(path) {
                const parent = path.parent;
                if (
                    parent.type === 'JSXAttribute' &&
                    ['title', 'label', 'placeholder', 'accessibilityLabel'].includes(parent.name.name)
                ) {
                    const text = path.node.value.trim();
                    if (text && stringToKeyMap[text]) {
                        replacementCount++;

                        // Create a JSX expression with t function call
                        const jsxExpr = t.jsxExpressionContainer(
                            t.callExpression(
                                t.identifier('t'),
                                [t.stringLiteral(stringToKeyMap[text])]
                            )
                        );

                        // Replace the string literal with the expression
                        path.parentPath.node.value = jsxExpr;
                    }
                }
            }
        });

        // Generate the modified code
        const output = generate(ast, { retainLines: true }, content);

        // Write the changes back to the file
        fs.writeFileSync(filePath, output.code);

        return replacementCount;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return 0;
    }
}

// Helper function to add useI18n hook to a component
function addI18nHookToComponent(path) {
    // Check if the component is using strings that need translation
    let needsI18n = false;
    path.traverse({
        StringLiteral(childPath) {
            // Simple heuristic: if the component has string literals used in JSX, 
            // it might need the i18n hook
            if (childPath.parent.type === 'JSXAttribute' ||
                childPath.parent.type === 'JSXElement') {
                needsI18n = true;
                childPath.stop(); // Stop traversing once we find one
            }
        },
        JSXText(childPath) {
            if (childPath.node.value.trim()) {
                needsI18n = true;
                childPath.stop(); // Stop traversing once we find one
            }
        }
    });

    if (!needsI18n) return;

    // Check if the component already has the useI18n hook
    let hasI18nHook = false;
    path.traverse({
        CallExpression(childPath) {
            if (childPath.node.callee.name === 'useI18n') {
                hasI18nHook = true;
                childPath.stop();
            }
        }
    });

    if (hasI18nHook) return;

    // Find the body of the component function
    const body = path.node.body;

    // Only add if the body is a block statement
    if (!t.isBlockStatement(body)) return;

    // Add the useI18n hook at the beginning
    const i18nHook = t.variableDeclaration(
        'const',
        [
            t.variableDeclarator(
                t.objectPattern([
                    t.objectProperty(t.identifier('t'), t.identifier('t'), false, true)
                ]),
                t.callExpression(t.identifier('useI18n'), [])
            )
        ]
    );

    body.body.unshift(i18nHook);
}

// Helper function to replace Text with FormattedText
function replaceTextWithFormattedText(path, text, translationKey) {
    const openingElement = path.node.openingElement;
    const closingElement = path.node.closingElement;

    // Since we're removing all children, always make FormattedText self-closing
    const formattedTextOpening = t.jsxOpeningElement(
        t.jsxIdentifier('FormattedText'),
        [
            ...openingElement.attributes,
            t.jsxAttribute(
                t.jsxIdentifier('id'),
                t.stringLiteral(translationKey)
            )
        ],
        true // Always set selfClosing to true
    );

    // Replace the Text element attributes and name with FormattedText
    path.node.openingElement = formattedTextOpening;
    // Since we're using self-closing tag, set closingElement to null
    path.node.closingElement = null;

    // Remove children since FormattedText doesn't need them
    path.node.children = [];
}

// Helper to check if a node is a React component
t.isReactComponent = (node) => {
    if (!node || !node.body) return false;

    // Check for JSX returns which indicate this is a component
    let hasJSX = false;
    babel.traverse(t.file(t.program([t.expressionStatement(node)])), {
        ReturnStatement(path) {
            const arg = path.node.argument;
            if (arg && arg.type === 'JSXElement') {
                hasJSX = true;
                path.stop();
            }
        },
        JSXElement() {
            hasJSX = true;
            this.stop();
        }
    }, null, { node });

    return hasJSX;
};

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
}); 