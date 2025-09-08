const fs = require('fs');
const path = require('path');

const folder = './'; // carpeta raíz del proyecto
const outputFile = 'proyecto_completo.txt';
const extensions = ['.jsx', '.js', '.ts', '.tsx', '.css', '.json', '.html'];

function getFiles(dir) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else if (extensions.includes(path.extname(fullPath))) {
            results.push(fullPath);
        }
    });
    return results;
}

const allFiles = getFiles(folder);
let allText = '';

allFiles.forEach(file => {
    allText += `\n\n// ===== ${file} =====\n\n`;
    allText += fs.readFileSync(file, 'utf8');
});

fs.writeFileSync(outputFile, allText, 'utf8');
console.log(`Archivo creado: ${outputFile}`);
