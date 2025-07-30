#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to update a single layout file
function updateLayoutFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "Field Boss - Lake" entries to use "Lake Field Boss" location
    const updatedContent = content.replace(
      /"Field Boss - Lake":\s*{\s*"location":\s*"Lake"/g,
      '"Field Boss - Lake": {\n    "location": "Lake Field Boss"'
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`No changes needed: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function to process all layout files
function main() {
  const layoutsDir = path.join(process.cwd(), 'reference_material', 'pattern_layouts');
  
  if (!fs.existsSync(layoutsDir)) {
    console.error('Layouts directory not found:', layoutsDir);
    process.exit(1);
  }
  
  const files = fs.readdirSync(layoutsDir)
    .filter(file => file.startsWith('layout_') && file.endsWith('.json'))
    .sort();
  
  console.log(`Found ${files.length} layout files to process...`);
  
  let updatedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(layoutsDir, file);
    if (updateLayoutFile(filePath)) {
      updatedCount++;
    }
  }
  
  console.log(`\nProcessing complete! Updated ${updatedCount} files.`);
}

if (require.main === module) {
  main();
} 