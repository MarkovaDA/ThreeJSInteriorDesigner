import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

type FurnitureCategory = {
  urlPath: string;
  fsPath: string;
};

type FurnitureModelEntry = {
  id: string;
  label: string;
  file: string;
};

const categories: FurnitureCategory[] = [
  {
    urlPath: 'furniture/sofa',
    fsPath: 'public/furniture/sofa',
  },
];

function formatModelLabel(filename: string): string {
  return filename
    .replace(/\.glb$/i, '')
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function listModels(fsPath: string): FurnitureModelEntry[] {
  const absolutePath = path.resolve(fsPath);

  if (!fs.existsSync(absolutePath)) {
    return [];
  }

  return fs
    .readdirSync(absolutePath)
    .filter((name) => name.toLowerCase().endsWith('.glb'))
    .sort((left, right) => left.localeCompare(right))
    .map((file) => ({
      id: file,
      label: formatModelLabel(file),
      file,
    }));
}

function matchesCatalogRequest(url: string | undefined, urlPath: string, base: string): boolean {
  if (!url) {
    return false;
  }

  const pathname = url.split('?')[0] ?? '';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const candidates = [
    `/${urlPath}/index.json`,
    `${normalizedBase}/${urlPath}/index.json`,
  ];

  return candidates.includes(pathname);
}

export function furnitureCatalogPlugin(): Plugin {
  let base = '/';

  return {
    name: 'furniture-catalog',
    configResolved(config) {
      base = config.base;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        for (const category of categories) {
          const requestUrl =
            typeof req.url === 'string' ? req.url : undefined;

          if (!matchesCatalogRequest(requestUrl, category.urlPath, base)) {
            continue;
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(listModels(category.fsPath)));

          return;
        }

        next();
      });
    },
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve('dist');

      for (const category of categories) {
        const destination = path.join(outDir, category.urlPath, 'index.json');

        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(
          destination,
          `${JSON.stringify(listModels(category.fsPath), null, 2)}\n`,
          'utf8',
        );
      }
    },
  };
}
