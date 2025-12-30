const fse = require('fs-extra');
const path = require('path');
const multiparty = require('multiparty');
// const { extractExt, getChunkDir } = require('../utils/fileUtils');

// const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// exports.uploadChunk = async (req, res) => {
//   const form = new multiparty.Form();
//   form.parse(req, async (err, fields, files) => {
//     if (err) return res.status(500).json({ code: -1, msg: '上传失败', data: err });

//     try {
//       const { fileHash, chunkHash } = fields;
//       const chunkDir = getChunkDir(UPLOAD_DIR, fileHash);
//       await fse.ensureDir(chunkDir);
//       await fse.move(files.chunkFile[0].path, path.join(chunkDir, chunkHash), { overwrite: true });
//       res.json({ code: "0000", msg: '切片上传成功' });
//     } catch (err) {
//       res.status(500).json({ code: -1, msg: '服务器错误', data: err });
//     }
//   });
// };

// exports.mergeChunks = async (req, res) => {
//   try {
//     const { fileHash, fileName, chunkSize } = req.body;
//     const ext = extractExt(fileName);
//     const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
//     const chunkDir = getChunkDir(UPLOAD_DIR, fileHash);

//     const chunkFiles = (await fse.readdir(chunkDir))
//       .sort((a, b) => a.split('-')[1] - b.split('-')[1]);

//     await Promise.all(chunkFiles.map((file, index) => {
//       const readStream = fse.createReadStream(path.join(chunkDir, file));
//       const writeStream = fse.createWriteStream(filePath, { start: index * chunkSize });
//       return new Promise(resolve => readStream.pipe(writeStream).on('finish', resolve));
//     }));

//     await fse.remove(chunkDir);
//     res.json({ code: "0000", msg: '文件合并成功' });
//   } catch (err) {
//     res.status(500).json({ code: -1, msg: '合并失败', data: err });
//   }
// };

// 大文件存储目录
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target');

// 创建临时文件夹用于临时存储 所有的文件切片
const getChunkDir = (fileHash) => {
  // 添加 chunkCache 前缀与文件名做区分
  // target/chunkCache_fileHash值
  return path.resolve(UPLOAD_DIR, `chunkCache_${fileHash}`);
};

// 处理切片上传
exports.uploadChunk = async (req, res) => {
  try {
    // 处理文件表单
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.send({ code: -1, msg: '单片上传失败', data: err });
        return false;
      }
      // fields是body参数
      // 文件hash ，切片hash ，文件名
      const { fileHash, chunkHash, fileName } = fields;
      // files是传过来的文件所在的真实路径以及内容
      const { chunkFile } = files;

      // 创建一个临时文件目录用于 临时存储所有文件切片
      const chunkCache = getChunkDir(fileHash);

      // 检查 chunkDir临时文件目录 是否存在，如果不存在则创建它。
      if (!fse.existsSync(chunkCache)) {
        await fse.mkdirs(chunkCache);
      }

      //   将上传的文件切片移动到指定的存储文件目录
      //  fse.move 方法默认不会覆盖已经存在的文件。
      //   将 overwrite: true 设置为 true，这样当目标文件已经存在时，将会被覆盖。
      //   把上传的文件移动到 /target/chunkCache_ + chunkHash
      await fse.move(chunkFile[0].path, `${chunkCache}/${chunkHash}`, {
        overwrite: true,
      });
      res.send({
        code: '0000',
        msg: '单片上传完成',
        data: { fileHash, chunkHash, fileName },
      });
    });
  } catch (errB) {
    res.send({ code: -1, msg: '单片上传失败', data: errB });
  }
};
// // 处理切片上传
// app.post('/upload', async (req, res) => {
//   try {
//     // 处理文件表单
//     const form = new multiparty.Form()
//     form.parse(req, async (err, fields, files) => {
//       if (err) {
//         res.send({ code: -1, msg: '单片上传失败', data: err })
//         return false
//       }
//       // fields是body参数
//       // 文件hash ，切片hash ，文件名
//       const { fileHash, chunkHash, fileName } = fields
//       // files是传过来的文件所在的真实路径以及内容
//       const { chunkFile } = files

//       // 创建一个临时文件目录用于 临时存储所有文件切片
//       const chunkCache = getChunkDir(fileHash)

//       // 检查 chunkDir临时文件目录 是否存在，如果不存在则创建它。
//       if (!fse.existsSync(chunkCache)) {
//         await fse.mkdirs(chunkCache)
//       }

//       //   将上传的文件切片移动到指定的存储文件目录
//       //  fse.move 方法默认不会覆盖已经存在的文件。
//       //   将 overwrite: true 设置为 true，这样当目标文件已经存在时，将会被覆盖。
//       //   把上传的文件移动到 /target/chunkCache_ + chunkHash
//       await fse.move(chunkFile[0].path, `${chunkCache}/${chunkHash}`, {
//         overwrite: true,
//       })
//       res.send({
//         code: "0000",
//         msg: '单片上传完成',
//         data: { fileHash, chunkHash, fileName },
//       })
//     })
//   } catch (errB) {
//     res.send({ code: -1, msg: '单片上传失败', data: errB })
//   }
// })

// 注意：由于使用了 express.json() 中间件，请求体已经自动解析到 req.body 中
// 不再需要手动解析请求体，直接使用 req.body 即可

// 把文件切片写成总的一个文件流
const pipeStream = (path, writeStream) => {
  return new Promise((resolve) => {
    // 创建可读流
    const readStream = fse.createReadStream(path).on('error', (err) => {
      // 如果在读取过程中发生错误，拒绝 Promise
      reject(err);
    });
    // 在一个指定位置写入文件流
    readStream.pipe(writeStream).on('finish', () => {
      // 写入完成后，删除原切片文件
      fse.unlinkSync(path);
      resolve();
    });
  });
};

// 合并切片
const mergeFileChunk = async (chunkSize, fileHash, filePath) => {
  try {
    // target/chunkCache_fileHash值
    const chunkCache = getChunkDir(fileHash);
    // 读取 临时所有切片目录 chunkCache 下的所有文件和子目录，并返回这些文件和子目录的名称。
    const chunkPaths = await fse.readdir(chunkCache);

    // 根据切片下标进行排序
    // 否则直接读取目录的获得的顺序会错乱
    chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1]);

    let promiseList = [];
    for (let index = 0; index < chunkPaths.length; index++) {
      // target/chunkCache_hash值/文件切片位置
      let chunkPath = path.resolve(chunkCache, chunkPaths[index]);
      // 根据 index * chunkSize 在指定位置创建可写流
      let writeStream = fse.createWriteStream(filePath, {
        start: index * chunkSize,
      });
      promiseList.push(pipeStream(chunkPath, writeStream));
    }

    // 使用 Promise.all 等待所有 Promise 完成
    // (相当于等待所有的切片已写入完成且删除了所有的切片文件)
    Promise.all(promiseList)
      .then(() => {
        console.log('所有文件切片已成功处理并删除');
        // 在这里执行所有切片处理完成后的操作
        // 递归删除缓存切片目录及其内容 (注意，如果删除不存在的内容会报错)
        if (fse.pathExistsSync(chunkCache)) {
          fse.remove(chunkCache);
          console.log(`chunkCache缓存目录删除成功`);
          // 合并成功，返回 Promise.resolve
          return Promise.resolve();
        } else {
          console.log(`${chunkCache} 不存在，不能删除`);

          return Promise.reject(`${chunkCache} 不存在，不能删除`);
        }
      })
      .catch((err) => {
        console.error('文件处理过程中发生错误：', err);
        // 在这里处理错误，可能需要清理资源等
        return Promise.reject(`'文件处理过程中发生错误：${err}`);
      });
  } catch (err) {
    console.log(err, '合并切片函数失败');
    return Promise.reject(`'合并切片函数失败：${err}`);
  }
};

// 提取文件后缀名
const extractExt = (fileName) => {
  // 查找'.'在fileName中最后出现的位置
  const lastIndex = fileName.lastIndexOf('.');
  // 如果'.'不存在，则返回空字符串
  if (lastIndex === -1) {
    return '';
  }
  // 否则，返回从'.'后一个字符到fileName末尾的子串作为文件后缀（包含'.'）
  return fileName.slice(lastIndex);
};
exports.mergeChunks = async (req, res) => {
  try {
    // 在上传完所有切片后就要调合并切片
    // 直接使用 req.body，因为 express.json() 中间件已经解析了请求体
    const { chunkSize, fileName, fileHash } = req.body;
    // 提取文件后缀名
    const ext = extractExt(fileName);
    // 整个文件路径 /target/文件hash.文件后缀
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
    // 开始合并切片
    await mergeFileChunk(chunkSize, fileHash, filePath);
    res.send({
      code: '0000',
      msg: '文件合并成功',
    });
  } catch (e) {
    res.send({
      code: -1,
      data: e,
      msg: '文件合并失败！',
    });
  }
};
// app.post('/merge', async (req, res) => {
//   try {
//     // 在上传完所有切片后就要调合并切片
//     const data = await resolvePost(req)
//     // 切片大小 文件名 文件hash
//     const { chunkSize, fileName, fileHash } = data
//     // 提取文件后缀名
//     const ext = extractExt(fileName)
//     // 整个文件路径 /target/文件hash.文件后缀
//     const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)
//     // 开始合并切片
//     await mergeFileChunk(chunkSize, fileHash, filePath)
//     res.send({
//       code: "0000",
//       msg: '文件合并成功',
//     })
//   } catch (e) {
//     res.send({
//       code: -1,
//       data: e,
//       msg: '文件合并失败！',
//     })
//   }
// })

// 返回已上传的所有切片名
const createUploadedList = async (fileHash) => {
  // 如果存在这个目录则返回这个目录下的所有切片
  // fse.readdir返回一个数组，其中包含指定目录中的文件名。
  return fse.existsSync(getChunkDir(fileHash))
    ? await fse.readdir(getChunkDir(fileHash))
    : [];
};

// 验证是否存在已上传切片
// app.post('/verify', async (req, res) => {
//   try {
//     const data = await resolvePost(req)
//     const { fileHash, fileName } = data

//     // 文件名后缀
//     const ext = extractExt(fileName)
//     // 最终文件路径
//     const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)

//     // 如果已经存在文件则标识文件已存在，不需要再上传
//     if (fse.existsSync(filePath)) {
//       res.send({
//         code: "0000",
//         data: {
//           shouldUpload: false,
//           uploadedList: [],
//         },
//         msg: '已存在该文件',
//       })
//     } else {
//       // 否则则返回文件已经存在切片给前端
//       // 告诉前端这些切片不需要再上传
//       res.send({
//         code: "0000",
//         data: {
//           shouldUpload: true,
//           uploadedList: await createUploadedList(fileHash),
//         },
//         msg: '需要上传文件/部分切片',
//       })
//     }
//   } catch (err) {
//     res.send({ code: -1, msg: '上传失败', data: err })
//   }
// })
exports.verify = async (req, res) => {
  try {
    // 直接使用 req.body，因为 express.json() 中间件已经解析了请求体
    const { fileHash, fileName } = req.body;

    if (!fileHash || !fileName) {
      return res.status(400).json({
        code: -1,
        msg: '参数错误：fileHash 和 fileName 为必填项',
        data: { fileHash, fileName },
      });
    }

    // 文件名后缀
    const ext = extractExt(fileName);
    // 最终文件路径
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
    // 如果已经存在文件则标识文件已存在，不需要再上传
    if (fse.existsSync(filePath)) {
      res.send({
        code: '0000',
        data: {
          shouldUpload: false,
          uploadedList: [],
        },
        msg: '已存在该文件',
      });
    } else {
      // 否则则返回文件已经存在切片给前端
      // 告诉前端这些切片不需要再上传
      // res.send({
      //   code: "0000",
      //   data: {
      //     shouldUpload: true,
      //     uploadedList: await createUploadedList(fileHash),
      //   },
      //   msg: '需要上传文件/部分切片',
      // })
      res.json({
        code: '0000',
        msg: '需要上传文件/部分切片',
        data: {
          shouldUpload: true,
          uploadedList: await createUploadedList(fileHash),
        },
      });
    }
  } catch (err) {
    res.send({ code: -1, msg: '上传失败', data: err });
  }
};
