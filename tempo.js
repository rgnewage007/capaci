// check-api-structure.js
const fs = require('fs');
const path = require('path');

function checkAPIStructure() {
    console.log('=== ESTRUCTURA REAL DE app/api ===');
    
    const apiPath = path.join(process.cwd(), 'app/api');
    
    if (!fs.existsSync(apiPath)) {
        console.log('❌ No existe la carpeta app/api');
        return;
    }

    function scanDirectory(dir, depth = 0) {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            const indent = '  '.repeat(depth);
            
            if (stat.isDirectory()) {
                console.log(`${indent}📁 ${item}/`);
                scanDirectory(fullPath, depth + 1);
            } else {
                console.log(`${indent}📄 ${item}`);
            }
        });
    }

    scanDirectory(apiPath);
}

checkAPIStructure();