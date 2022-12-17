import { access, appendFile } from 'node:fs/promises';

const create = async (path) => {
  try {
    const resp = await access(path);
    if (!resp) {
      return Promise.reject(new Error('FS operation failed'));
    }
  } catch {
    await appendFile(path, '');
  }
};

export default create;
