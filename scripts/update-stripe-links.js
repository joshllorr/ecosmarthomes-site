import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const searchTargets = [
  'https://buy.stripe.com/test_aFabJ01EGbPz6tn8UYeME00',
  'https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00'
];
const replaceTarget = '/checkout/';

let count = 0;
let fileCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (stat.isFile() && /\.(html|js|json|ts|md)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let fileModified = false;
      for (const target of searchTargets) {
        if (content.includes(target)) {
          const matches = (content.match(new RegExp(target, 'g')) || []).length;
          content = content.replaceAll(target, replaceTarget);
          count += matches;
          fileModified = true;
          console.log(`Updated ${matches} instances of ${target} in: ${path.relative(rootDir, fullPath)}`);
        }
      }
      if (fileModified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        fileCount++;
      }
    }
  }
}

walkDir(rootDir);
console.log(`\n✅ Completed! Replaced ${count} occurrences across ${fileCount} files.`);
