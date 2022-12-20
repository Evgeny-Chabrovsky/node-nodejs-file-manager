import { createReadStream, createWriteStream } from 'node:fs';
import { createBrotliDecompress } from 'node:zlib';
import { access, rm } from 'node:fs/promises';

const decompress = async (pathToFile, destination, cb) => {
  try {
    await access(pathToFile);
    const brotli = createBrotliDecompress();
    const readStream = createReadStream(pathToFile);
    const writeStream = createWriteStream(destination);

    readStream
      .pipe(brotli)
      .pipe(writeStream)
      .on('finish', async () => {
        try {
          await rm(pathToFile);
        } catch (err) {
          console.log(err);
        }
        cb();
      })
      .on('error', (err) => {
        console.log(err);
        console.log('Operation failed');
      });
  } catch {
    console.log('Operation failed');
    cb();
  }
};

export default decompress;
