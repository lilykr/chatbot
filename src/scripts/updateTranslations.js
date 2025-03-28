const fs = require('node:fs');
const path = require('node:path');

// Paths
const EXTRACTED_STRINGS_FILE = path.resolve(__dirname, './extracted-strings.json');
const TRANSLATION_FILES = {
    en: path.resolve(__dirname, '../i18n/en.ts'),
    fr: path.resolve(__dirname, '../i18n/fr.ts'),
    // Add more languages as needed
};

// Main function
async function main() {
    console.log('Updating translation files...');

    // Load extracted strings
    if (!fs.existsSync(EXTRACTED_STRINGS_FILE)) {
        console.error(`Error: Extracted strings file not found at ${EXTRACTED_STRINGS_FILE}`);
        console.error('Please run the extractText.js script first');
        process.exit(1);
    }

    const extractedData = JSON.parse(fs.readFileSync(EXTRACTED_STRINGS_FILE, 'utf8'));
    const extractedStrings = extractedData.strings;

    // Process each translation file
    for (const [lang, filePath] of Object.entries(TRANSLATION_FILES)) {
        if (!fs.existsSync(filePath)) {
            console.log(`Creating new translation file for ${lang}`);
            createNewTranslationFile(lang, filePath, extractedStrings);
        } else {
            console.log(`Updating existing translation file for ${lang}`);
            updateExistingTranslationFile(lang, filePath, extractedStrings);
        }
    }

    console.log('Translation files updated successfully');
}

// Create a new translation file
function createNewTranslationFile(lang, filePath, extractedStrings) {
    const translations = {};

    // For English, use the extracted strings directly
    // For other languages, leave the values empty for translators to fill in
    for (const [key, value] of Object.entries(extractedStrings)) {
        translations[key] = lang === 'en' ? value : '';
    }

    // Create the file content
    let content = 'const ' + lang + ' = {\n';

    // Add existing common translations if this is not English
    if (lang !== 'en') {
        content += '  // Common translations\n';
        content += `  "common.hello": "${lang === 'fr' ? 'Bonjour' : 'Hello'}",\n`;
        content += `  "common.welcome": "${lang === 'fr' ? 'Bienvenue dans notre application' : 'Welcome to our app'}",\n`;
        content += `  "common.back": "${lang === 'fr' ? 'Retour' : 'Back'}",\n`;
        content += `  "common.next": "${lang === 'fr' ? 'Suivant' : 'Next'}",\n\n`;
    }

    // Add the extracted strings
    content += '  // Auto-generated translations\n';
    for (const [key, value] of Object.entries(translations)) {
        content += `  "${key}": "${escapeString(value)}",\n`;
    }

    // Close the object and add exports
    content = content.slice(0, -2) + '\n};\n\n';
    content += `export default ${lang};\n`;

    // For English, also export the type definition
    if (lang === 'en') {
        content += '\n// Type definition based on the flattened structure\n';
        content += `export type TranslationId = keyof typeof ${lang};\n`;
    }

    fs.writeFileSync(filePath, content);
}

// Update an existing translation file
function updateExistingTranslationFile(lang, filePath, extractedStrings) {
    // Read the current translation file
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse the translation object from the file
    // This is a simple regex-based approach - for more complex files, use a proper TS/JS parser
    const translationObjectMatch = content.match(/const\s+[a-z]+\s*=\s*({[\s\S]*?});/);
    if (!translationObjectMatch) {
        console.error(`Error: Could not parse translation object in ${filePath}`);
        return;
    }

    // Extract existing translations
    const existingTranslations = {};
    const translationPairs = translationObjectMatch[1].match(/"([^"]+)":\s*"([^"]*)"/g) || [];

    for (const pair of translationPairs) {
        const [key, value] = pair.split(/:\s*/).map(part =>
            part.trim().replace(/^"|"$/g, '')
        );
        existingTranslations[key] = value;
    }

    // Merge with extracted strings
    for (const [key, value] of Object.entries(extractedStrings)) {
        if (!existingTranslations[key]) {
            existingTranslations[key] = lang === 'en' ? value : '';
        }
    }

    // Create updated content
    const updatedContent = content.replace(
        /const\s+[a-z]+\s*=\s*{[\s\S]*?};/,
        createTranslationObject(lang, existingTranslations)
    );

    fs.writeFileSync(filePath, updatedContent);
}

// Helper to create a translation object string
function createTranslationObject(lang, translations) {
    let content = `const ${lang} = {\n`;

    // Sort keys for better organization
    const sortedKeys = Object.keys(translations).sort();

    for (const key of sortedKeys) {
        content += `  "${key}": "${escapeString(translations[key])}",\n`;
    }

    return content.slice(0, -2) + '\n};';
}

// Helper to escape special characters in strings
function escapeString(str) {
    if (!str) return '';
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
}); 