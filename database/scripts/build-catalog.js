const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../documents');
const OUTPUT_DIR = path.join(__dirname, '../assets/catalog');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'root.json');

const VALID_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx'];

function buildCatalog() {
    if (!fs.existsSync(DOCS_DIR)) {
        console.error(`[ERRO] Diretório não encontrado: ${DOCS_DIR}`);
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const categories = [];
    const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true });

    entries.forEach(entry => {
        if (entry.isDirectory()) {
            const categoryName = entry.name;
            const categoryPath = path.join(DOCS_DIR, categoryName);
            
            const files = fs.readdirSync(categoryPath)
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return VALID_EXTENSIONS.includes(ext) && !file.startsWith('.');
                })
                .map(file => {
                    // Mapeia o nome do arquivo e gera a URL tratada para o navegador
                    const relativePath = `documents/${categoryName}/${file}`;
                    const encodedPath = `documents/${encodeURIComponent(categoryName)}/${encodeURIComponent(file)}`;
                    
                    return {
                        title: file,
                        path: relativePath,
                        encodedPath: encodedPath
                    };
                });

            categories.push({
                id: categoryName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_"),
                name: categoryName,
                itemCount: files.length,
                items: files
            });
        }
    });

    const catalogData = {
        updatedAt: new Date().toISOString(),
        totalCategories: categories.length,
        categories: categories
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalogData, null, 2), 'utf-8');
    console.log(`[SUCESSO] Catálogo gerado em ${OUTPUT_FILE} com ${categories.length} categorias.`);
}

buildCatalog();
