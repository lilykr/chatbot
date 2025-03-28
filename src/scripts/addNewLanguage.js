const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Paths
const I18N_DIR = path.resolve(__dirname, '../i18n');
const SCRIPTS_DIR = path.resolve(__dirname, './');

// Language codes and their names
const LANGUAGE_OPTIONS = {
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
};

// Main function
async function main() {
    console.log('Add a New Language for Translation\n');
    console.log('Available language options:');

    // Show available languages
    for (const [code, name] of Object.entries(LANGUAGE_OPTIONS)) {
        console.log(`- ${code}: ${name}`);
    }

    // Ask for language code
    const langCode = await askQuestion('\nEnter the language code (or type a custom code): ');

    // Validate language
    const langName = LANGUAGE_OPTIONS[langCode] || 'Custom Language';
    console.log(`\nAdding support for ${langName} (${langCode})...`);

    // Create language file
    await createLanguageFile(langCode);

    // Update updateTranslations.js script
    await updateTranslationsScript(langCode);

    console.log('\nDone! Next steps:');
    console.log('1. Run "npm run update-translations" to populate your new language file');
    console.log('2. Translate the strings in the new language file');

    rl.close();
}

// Helper to ask a question
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Create a new language file
async function createLanguageFile(langCode) {
    const filePath = path.join(I18N_DIR, `${langCode}.ts`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
        console.log(`File ${filePath} already exists. Skipping creation.`);
        return;
    }

    // Create basic structure for language file
    const content = `const ${langCode} = {
  // Common translations
  "common.hello": "",
  "common.welcome": "",
  "common.back": "",
  "common.next": "",
  "common.cancel": "",
  "common.save": "",
  
  // Add more translations here
};

export default ${langCode};
`;

    // Write the file
    fs.writeFileSync(filePath, content);
    console.log(`Created language file: ${filePath}`);
}

// Update the updateTranslations.js script to include the new language
async function updateTranslationsScript(langCode) {
    const filePath = path.join(SCRIPTS_DIR, 'updateTranslations.js');

    // Read the current file
    if (!fs.existsSync(filePath)) {
        console.error(`Error: ${filePath} not found`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Find the TRANSLATION_FILES object
    const regex = /(const TRANSLATION_FILES = {[^}]+)(})/;
    const match = content.match(regex);

    if (!match) {
        console.error('Could not find TRANSLATION_FILES object in updateTranslations.js');
        return;
    }

    // Check if language is already included
    if (content.includes(`${langCode}: path.resolve`)) {
        console.log(`Language ${langCode} is already included in updateTranslations.js`);
        return;
    }

    // Add the new language
    const newEntry = `  ${langCode}: path.resolve(__dirname, '../i18n/${langCode}.ts'),\n  `;
    const updatedContent = content.replace(regex, `$1${newEntry}$2`);

    // Write the updated content
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${filePath} to include ${langCode}`);
}

main().catch(err => {
    console.error('Error:', err);
    rl.close();
    process.exit(1);
}); 