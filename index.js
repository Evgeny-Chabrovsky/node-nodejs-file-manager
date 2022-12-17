import { rename } from 'node:fs/promises';
import * as os from 'node:os';
import { access } from 'node:fs';
import path from 'node:path';

import list from './src/list.js';
import read from './src/read.js';
import create from './src/create.js';
import copy from './src/copy.js';
import remove from './src/delete.js';
import calculateHash from './src/calcHash.js';
import compress from './src/compress.js';
import decompress from './src/decompress.js';

const homedirPath = os.homedir();
process.chdir(homedirPath);

function showPathToWorkingDirectory() {
  console.log(`You are currently in ${process.cwd()}`);
}

const userName =
  process.argv.length > 2
    ? process.argv[2].match(/--username\s*=\s*(.*)/)[1]
    : 'Anonymous';

console.log(`Welcome to the File Manager, ${userName}!`);
showPathToWorkingDirectory();

process.stdin.on('data', async (data) => {
  if (data.toString().match('.exit')) {
    console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
    process.exit();
  }
  //UP
  else if (data.toString().match('up\n')) {
    const currentDir = process.cwd();
    process.chdir(path.dirname(currentDir));
    showPathToWorkingDirectory();
  }
  //CD
  else if (data.toString().match(/^cd\s+/g)) {
    const currentDir = process.cwd();
    const enteredPath = data.toString().match(/cd\s+(.*)/)[1];
    try {
      process.chdir(path.resolve(currentDir, enteredPath));
    } catch (err) {
      console.log('Invalid input');
    } finally {
      showPathToWorkingDirectory();
    }
  }
  //LS
  else if (data.toString().match(/^ls\n/)) {
    const currentDir = process.cwd();
    const filesList = await list(path.resolve(currentDir));

    const sortedFileList = filesList
      .map((item) => {
        if (item.isDirectory()) {
          return { Name: item.name, Type: 'directory' };
        }

        return { Name: item.name, Type: 'file' };
      })
      .sort((a, b) => {
        if (a.Type > b.Type) {
          return 1;
        }
        if (a.Type < b.Type) {
          return -1;
        }

        return 0;
      });

    console.table(sortedFileList, ['Name', 'Type']);
    showPathToWorkingDirectory();
  }
  //CAT
  else if (data.toString().match(/^cat\s+(.*)\n/)) {
    const currentDir = process.cwd();
    const enteredPath = data.toString().match(/cat\s+(.*)/)[1];
    const pathToFile = path.resolve(currentDir, enteredPath);
    await read(pathToFile, showPathToWorkingDirectory);
  }
  //ADD
  else if (data.toString().match(/^add\s+(.*)\n/)) {
    const currentDir = process.cwd();
    const enteredFile = data.toString().match(/add\s+(.*)/)[1];
    const pathForNewFile = path.resolve(currentDir, enteredFile);
    try {
      await create(pathForNewFile);
    } catch {
      console.log('Invalid Input');
    } finally {
      showPathToWorkingDirectory();
    }
  }
  //RN
  else if (data.toString().match(/^rn\s*(.*)\s+(.*)\n/)) {
    const currentDir = process.cwd();
    const enteredString = data.toString().match(/^rn\s+(.+)\s+(.+)/);
    const enteredPathToFile = enteredString[1];
    const newFileName = enteredString[2];
    const oldPath = path.resolve(currentDir, enteredPathToFile);
    const oldPathDirname = path.dirname(oldPath);
    const newPath = path.resolve(oldPathDirname, newFileName);

    access(newPath, async (err) => {
      if (err) {
        try {
          await rename(oldPath, newPath);
        } catch {
          console.log('Operation failed');
        } finally {
          showPathToWorkingDirectory();
        }
      } else {
        console.log('Operation failed');
      }
    });
  }
  //CP, MV
  else if (data.toString().match(/^(cp|mv)\s*(.*)\s+(.*)\n/)) {
    const currentDir = process.cwd();
    const enteredString = data.toString().match(/^(cp|mv)\s+(.+)\s+(.+)/);
    const operation = enteredString[1];
    const pathToFile = path.resolve(currentDir, enteredString[2]);
    const fileName = path.parse(pathToFile);
    const pathToNewDirectory = path.resolve(
      currentDir,
      enteredString[3],
      fileName.base
    );

    try {
      await copy(
        pathToFile,
        pathToNewDirectory,
        operation === 'mv',
        showPathToWorkingDirectory
      );
      showPathToWorkingDirectory();
    } catch (err) {
      console.log(err);
    }
  }
  //RM
  else if (data.toString().match(/^rm\s+/g)) {
    const currentDir = process.cwd();
    const enteredPath = data.toString().match(/rm\s+(.*)/)[1];
    const pathToFile = path.resolve(currentDir, enteredPath);
    await remove(pathToFile);
    showPathToWorkingDirectory();
  }
  //OS
  else if (data.toString().match(/^os\s+--(.+)/g)) {
    const enteredArgument = data.toString().match(/^os\s+--(.+)/)[1];

    if (enteredArgument === 'EOL') {
      console.log(JSON.stringify(os.EOL));
      showPathToWorkingDirectory();
    } else if (enteredArgument === 'cpus') {
      console.log(os.cpus());
      showPathToWorkingDirectory();
    } else if (enteredArgument === 'homedir') {
      console.log(os.homedir());
      showPathToWorkingDirectory();
    } else if (enteredArgument === 'username') {
      const { username } = os.userInfo();
      console.log(username);
      showPathToWorkingDirectory();
    } else if (enteredArgument === 'architecture') {
      console.log(os.arch());
      showPathToWorkingDirectory();
    } else {
      console.log('Invalid input');
      showPathToWorkingDirectory();
    }
  }
  //HASH
  else if (data.toString().match(/^hash\s+/g)) {
    const currentDir = process.cwd();
    const enteredPath = data.toString().match(/^hash\s+(.*)/)[1];
    const pathToFile = path.resolve(currentDir, enteredPath);
    await calculateHash(pathToFile);
    showPathToWorkingDirectory();
  }
  //COMPRESS, DECOMPRESS
  else if (data.toString().match(/^(compress|decompress)\s+(.*)\s+(.*)\n/g)) {
    const currentDir = process.cwd();
    const enteredString = data
      .toString()
      .match(/^(compress|decompress)\s+(.+)\s+(.+)/);
    const operation = enteredString[1];
    const pathToFile = path.resolve(currentDir, enteredString[2]);
    const fileName = path.parse(pathToFile);
    const pathToDestination = path.resolve(
      currentDir,
      enteredString[3],
      `${operation === 'compress' ? `${fileName.base}.br` : fileName.name}`
    );

    try {
      operation === 'compress'
        ? await compress(
            pathToFile,
            pathToDestination,
            showPathToWorkingDirectory
          )
        : await decompress(
            pathToFile,
            pathToDestination,
            showPathToWorkingDirectory
          );
    } catch (err) {
      console.log('Invalid input');
    }
  } else {
    console.log('Invalid input');
    showPathToWorkingDirectory();
  }
});

process.on('SIGINT', () => {
  console.log(`\nThank you for using File Manager, ${userName}, goodbye!`);
  process.exit();
});
