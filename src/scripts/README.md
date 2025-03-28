# i18n Migration Scripts

This directory contains scripts to automate the process of internationalizing your React Native app.

## Prerequisites

- Node.js 14+
- npm or yarn

## Setup

1. Install the required dependencies:

```bash
cd src/scripts
npm install
```

## Usage

The migration process consists of three steps:

1. **Extract text** - Scans your codebase to find hardcoded strings
2. **Update translations** - Updates translation files with the extracted strings
3. **Replace hardcoded strings** - Replaces Text components with FormattedText components

You can run these steps individually or all at once:

### Run the full migration

```bash
npm run migrate
```

### Run steps individually

```bash
# Extract text from your codebase
npm run extract

# Update translation files with extracted strings
npm run update-translations

# Replace hardcoded strings with i18n components
npm run replace

# Add support for a new language
npm run add-language

# Export translations to CSV for translators
npm run export-translations
# or with options:
npm run export-translations -- --lang=en --output=translations.csv

# Test translations coverage and find missing translations
npm run test-translations
# or with options:
npm run test-translations -- --langs=fr,es --verbose
```

## What the Scripts Do

### 1. extractText.js

Scans your codebase for:
- Text content in `<Text>` components
- String literals in props like `title`, `label`, `placeholder`, etc.

Generates a JSON file with all extracted strings and their file locations.

### 2. updateTranslations.js

- Takes the extracted strings and adds them to your translation files
- For English, it uses the extracted text as the translation value
- For other languages, it leaves the values empty to be filled in later

### 3. replaceHardcodedStrings.js

- Replaces `<Text>` components with `<FormattedText>` components
- Adds the necessary imports for i18n components
- Adds the `useI18n` hook to components that need translation
- Creates backups of all modified files in `.translation-backups`

### 4. addNewLanguage.js

- Interactive script to add support for a new language
- Creates a new language file in your i18n directory
- Updates the `updateTranslations.js` script to include the new language
- Provides a list of common language codes to choose from

### 5. exportTranslations.js

- Exports translations from a specific language file to CSV format
- Useful for sending to translators
- Includes the key, original text, and context information
- Can specify source language and output file via command-line options

### 6. testTranslations.js

- Analyzes translation coverage across all language files
- Identifies missing translations and empty values
- Provides statistics on translation completeness
- Helps track translation progress during development

## Post-Migration Steps

After running the scripts:

1. Review the changes to ensure they're correct
2. Fill in translations for non-English languages
3. Test your app in different languages
4. Add new strings to translation files as your app evolves

## Adding New Languages

To add support for a new language:

1. Run the interactive script:
   ```bash
   npm run add-language
   ```
2. Follow the prompts to select or enter a language code
3. Run the update-translations script to populate the new file with keys:
   ```bash
   npm run update-translations
   ```

## Working with External Translators

To work with external translators:

1. Export your translations to CSV:
   ```bash
   npm run export-translations -- --lang=en --output=translations_for_translation.csv
   ```
2. Send the CSV file to your translators
3. When you receive the translated file, import it back into your app (see TRANSLATION_WORKFLOW.md)

## Monitoring Translation Progress

To check the status of your translations:

```bash
npm run test-translations -- --verbose
```

This will show:
- Total number of translation keys
- Percentage of translations completed for each language
- Missing and empty translations

## Troubleshooting

- If you encounter errors during the migration, check the backup files in `.translation-backups`
- The scripts are designed to be idempotent - you can run them multiple times safely
- For complex components, manual adjustments may be needed after the automated migration 