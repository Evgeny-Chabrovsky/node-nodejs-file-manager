import { rename as renameNode } from 'node:fs/promises';
import { access } from 'node:fs';

const rename = async (oldPath, newPath) => {
  return new Promise((resolve, reject) => {
    access(newPath, async (err) => {
      if (err) {
        await renameNode(oldPath, newPath);
      } else {
        reject('Operation failed');
      }
    });
  });
};

export default rename;
