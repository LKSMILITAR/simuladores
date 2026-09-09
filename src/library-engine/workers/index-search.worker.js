let searchIndex = [];

self.onmessage = function (event) {
  const { type, payload } = event.data;

  switch (type) {
    case 'INDEX_DATA':
      buildIndex(payload);
      self.postMessage({ type: 'INDEX_READY', payload: { count: searchIndex.length } });
      break;

    case 'SEARCH':
      const results = queryIndex(payload.term);
      self.postMessage({ type: 'SEARCH_RESULTS', payload: { results, term: payload.term } });
      break;

    default:
      console.warn('[Worker] Tipo de mensagem desconhecido:', type);
  }
};

function buildIndex(node, currentPath = '') {
  if (Array.isArray(node)) {
    searchIndex = [];
    node.forEach(item => buildIndex(item, ''));
    return;
  }

  if (node.categories || node.folders) {
    const subFolders = node.categories || node.folders;
    subFolders.forEach(folder => {
      searchIndex.push({ name: folder.name, path: folder.path, type: 'folder' });
      if (folder.children) buildIndex(folder.children, folder.path);
    });
  }

  if (node.files) {
    node.files.forEach(file => {
      searchIndex.push({ name: file.name, path: file.path, type: 'file', size: file.size });
    });
  }
}

function queryIndex(term) {
  if (!term || term.trim() === '') return [];
  const normalizedTerm = term.toLowerCase().trim();

  const matches = [];
  for (let i = 0; i < searchIndex.length; i++) {
    const item = searchIndex[i];
    if (item.name.toLowerCase().includes(normalizedTerm)) {
      matches.push(item);
      if (matches.length >= 50) break;
    }
  }
  return matches;
}
