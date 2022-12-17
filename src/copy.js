import { createReadStream, createWriteStream } from 'node:fs';
import { access, rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

const copy = async (pathToFile, pathToDirectory, isRemoveAfter, cb) => {
  try {
    await access(pathToFile);
    const resp = await access(pathToDirectory);
    if (!resp) {
      return Promise.reject('Operation failed');
    }
  } catch {
    const readStream = createReadStream(pathToFile, {
      encoding: 'utf8',
    });
    const writeStream = createWriteStream(pathToDirectory);

    await pipeline(
      readStream
        .on('end', async () => {
          if (isRemoveAfter) {
            await rm(pathToFile);
          }
        })
        .on('error', () => {
          console.log('Operation failed');
          cb();
        }),
      writeStream.on('error', () => {
        console.log('Operation failed');
        cb();
      })
    );
  }
};

export default copy;
