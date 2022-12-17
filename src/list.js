import { readdir } from 'node:fs/promises';

 const list = async (path) => {

  try {
    const files = await readdir(path, {withFileTypes:true});
    return files;
  } catch {
    throw new Error('FS operation failed');
  }
};

export default list