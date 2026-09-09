const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOURCE_DIR = path.resolve('documents');
const OUTPUT_DIR = path.resolve('assets/catalog');
const CHUNKS_DIR = path.join(OUTPUT_DIR, 'chunks');

function cleanAndEnsureDirectories() {
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });

  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
  }
}

function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 10);
}

function scanDirectory(currentPath, relativePath = '') {
  if (!fs.existsSync(currentPath)) return { folders: [], files: [] };

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  const folders = [];
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(currentPath, entry.name);
    const relPath = path.join(relativePath, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      const childData = scanDirectory(fullPath, relPath);
      const chunkHash = generateHash(relPath);
      const chunkFileName = `chunk-${chunkHash}.json`;

      fs.writeFileSync(
        path.join(CHUNKS_DIR, chunkFileName),
        JSON.stringify({ path: relPath, ...childData }, null, 2)
      );

      folders.push({
        name: entry.name,
        path: relPath,
        chunk: `assets/catalog/chunks/${chunkFileName}`,
        itemCount: childData.folders.length + childData.files.length
      });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.pdf', '.txt', '.md'].includes(ext)) {
        const stats = fs.statSync(fullPath);
        files.push({
          name: entry.name,
          path: relPath,
          size: stats.size,
          extension: ext
        });
      }
    }
  }

  return { folders, files };
}

try {
  console.log('[Catalog Builder] Executando purge de arquivos antigos...');
  cleanAndEnsureDirectories();

  console.log('[Catalog Builder] Mapeando estrutura atual em documents/...');
  const data = scanDirectory(SOURCE_DIR);

  const rootManifest = {
    generatedAt: new Date().toISOString(),
    totalRootCategories: data.folders.length,
    categories: data.folders,
    files: data.files
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'root.json'),
    JSON.stringify(rootManifest, null, 2)
  );

  console.log(`[Catalog Builder] Catálogo atualizado com sucesso em: ${OUTPUT_DIR}`);
} catch (error) {
  console.error('[Catalog Builder] Falha crítica no gerador:', error);
  process.exit(1);
}
