const cheerio = require('cheerio');
const fs = require('fs');

const stealthyRequire = require('stealthy-require');
const request = stealthyRequire(require.cache, function () {
  return require('request');
});

const configure = require('request-promise-core/configure/request2');

configure({
  request: request,
  PromiseImpl: Promise,
  expose: [
    'then',
    'catch',
    'promise'
  ],
  constructorMixin: function (resolve, reject) {
  }
});

const asyncFunc = (i) => {
  return new Promise((resolve, reject) => {
    request(`https://mtcos.net/category/quanbu/page/${i}/`)
      .then((htmlString) => {
        const $ = cheerio.load(htmlString);
        let arr = [];
        $('.con_img').each(function (i, elem) {
          arr.push($(elem).attr("href"));
        });
        resolve(arr);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

const createFolder = async (path, name) => {
  // try {
  //   fs.accessSync('output', fs.constants.R_OK | fs.constants.W_OK);
  //   console.log('可以读写');
  // } catch (err) {
  //   console.error('无权访问');
  // }

  fs.mkdir(`${path}${name}`, (err) => {
    if (err) {
      return false;
    }
    console.log(`文件夹${name}创建成功`);
  })
}

const writeImage = async (url, path) => {
  try {
    request(url).pipe(fs.createWriteStream(path));
  } catch (err) {
    console.log(`${path}写入失败`);
  }
}

const main = async function () {
  for (let i = 0; i <= 15; i++) {
    await asyncFunc(i).then((res) => {
      res.forEach((item) => {
        request(item)
          .then((htmlString) => {
            const $ = cheerio.load(htmlString);
            let _arr = [];
            _arr.push($('.dat_b img').attr('src'));
            $('.lightgallery-term').each((i, elem) => {
              _arr.push($(elem).attr("href"));
            });
            createFolder('./src/output/', $('title').text()).then(() => {
              _arr.forEach((url, index) => {
                writeImage(url, './src/output/' + $('title').text() + '/' + `${index}.jpg`);
              })
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
    });
  }
}

main();
