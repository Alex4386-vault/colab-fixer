import { buildLogger } from './logger';
import fs from 'fs';

const isVerbose = process.argv.map((n) => n.toLowerCase()).includes('--verbose');

export const logger = buildLogger({
  level: isVerbose ? 'silly' : undefined,
});

logger.info('start');
const file = JSON.parse(fs.readFileSync('./work.ipynb', { encoding: 'utf-8' }));

for (const cell of file.cells) {
  if (cell.cell_type === 'markdown') {
    const sources = cell.source;
    const killTarget = [];

    for (let i = sources.length - 1; i >= 0; i--) {
      if (sources[i].length > 1000 && sources[i].startsWith('![image')) {
        killTarget.push(i);
      }
    }

    for (const i of killTarget) {
      cell.source.splice(i, 1);
    }
  } else if (cell.cell_type === 'code') {
    cell.outputs = undefined;
    cell.metadata = {
      id: cell.metadata.id,
    };
  }
}

logger.info('complete');
fs.writeFileSync('./work.complete.ipynb', JSON.stringify(file, null, 2));
