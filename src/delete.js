import { access, rm } from 'node:fs/promises';

const remove = async (path) => {
  try {
    await access(path);
    await rm(path);
  } catch {
    console.log('Operation failed');
  }
};

export default remove;
