const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOURCE_DIR = path.resolve('documents');
const OUTPUT_DIR = path.resolve('assets/catalog');
const CHUNKS_DIR = path.join(OUTPUT_DIR, 'chunks');

function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(CHUNKS_DIR)) fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

function generateHash(inputString) {
  return crypto.createHash('sha256').update(inputString).digest('hex').substring(0, 12);
}

function scanDirectory(currentPath, relativePath = '') {
  if (!fs.existsSync(currentPath)) return { folders: [], files: [] };

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const folders = [];
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullEntryPath = path.join(currentPath, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      const chunkHash = generateHash(entryRelativePath);
      const childData = scanDirectory(fullEntryPath, entryRelativePath);
      
      const chunkFileName = `chunk-${chunkHash}.json`;
      fs.writeFileSync(
        path.join(CHUNKS_DIR, chunkFileName),
        JSON.stringify({ path: entryRelativePath, ...childData }, null, 2)
      );

      folders.push({
        name: entry.name,
        path: entryRelativePath,
        chunk: `assets/catalog/chunks/${chunkFileName}`,
        itemCount: childData.folders.length + childData.files.length
      });
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullEntryPath);
      files.push({
        name: entry.name,
        path: entryRelativePath,
        size: stats.size,
        extension: path.extname(entry.name).toLowerCase()
      });
    }
  }

  return { folders, files };
}

function build() {
  console.log('[Catalog Builder] Iniciando escaneamento do repositório...');
  ensureDirectories();

  if (!fs.existsSync(SOURCE_DIR)) {
    console.warn(`[Catalog Builder] Criando pasta 'documents/' inicial.`);
    fs.mkdirSync(path.join(SOURCE_DIR, 'Geral'), { recursive: true });
    fs.writeFileSync(path.join(SOURCE_DIR, 'Geral/boas_vindas.txt'), 'Bem-vindo ao LKSMILITAR Database');
  }

  const rootData = scanDirectory(SOURCE_DIR);

  const rootManifest = {
    generatedAt: new Date().toISOString(),
    totalRootCategories: rootData.folders.length,
    categories: rootData.folders,
    files: rootData.files
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'root.json'),
    JSON.stringify(rootManifest, null, 2)
  );

  console.log(`[Catalog Builder] Sucesso! Raiz e chunks gerados em: ${OUTPUT_DIR}`);
}

build();
