const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace background style and mouse handlers
  content = content.replace(/style=\{\{\s*background:\s*'var\(--brand-green\)'\s*\}\}/g, '');
  content = content.replace(/onMouseOver=\{[^}]+\}/g, '');
  content = content.replace(/onMouseOut=\{[^}]+\}/g, '');

  // For buttons that already have a className, we need to append btn-primary
  // This is a bit tricky, but we can do a simpler replacement for the main buttons
  // Actually, let's just do it manually for the files.
}
