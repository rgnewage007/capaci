// merge-code.js
const fs = require('fs');
const path = require('path');

const outputFile = 'code-analysis.txt';
const files = [
    'app/api/courses/[courseId]/presentation/route.ts',
    'app/courses/[courseId]/page.tsx',
    'app/courses/[courseId]/presentation/page.tsx'
];

async function mergeFiles() {
    try {
        // Encabezado del archivo
        let content = `=== ANÁLISIS DE CÓDIGO - PROGRESSBAR ISSUE ===\n\n`;
        content += `Fecha: ${new Date().toLocaleString()}\n\n`;

        // Recorrer cada archivo y agregar su contenido
        for (const file of files) {
            const filePath = path.join(process.cwd(), file);
            
            if (fs.existsSync(filePath)) {
                content += `=== ARCHIVO: ${file} ===\n\n`;
                const fileContent = fs.readFileSync(filePath, 'utf8');
                content += fileContent;
                content += '\n\n';
            } else {
                content += `=== ARCHIVO: ${file} ===\n\n`;
                content += `❌ ARCHIVO NO ENCONTRADO\n\n`;
            }
        }

        // Escribir el archivo de salida
        fs.writeFileSync(outputFile, content, 'utf8');
        console.log(`✅ Archivo generado: ${outputFile}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar el script
mergeFiles();