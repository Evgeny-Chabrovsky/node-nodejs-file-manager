import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const calculateHash = async (path) => {
  try {
    const fileBuffer = await readFile(path);
    const hashSum = createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    console.log(hex);
  } catch {
    console.log('Operation failed');
  }
};

export default calculateHash;
