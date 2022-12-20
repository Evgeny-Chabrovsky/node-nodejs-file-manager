import { createReadStream } from 'node:fs';

const read = async (path, cb) => {
  const readStream = createReadStream(path, 'utf8');
  readStream.on('data', (chunk) => {
    process.stdout.write(`${chunk}\n`);
    cb();
  });
  readStream.on('error', () => {
    process.stdout.write('Invalid input\n');
    cb();
  });
};

export default read;
