const fs = require('fs');
const { exec } = require('child_process');
const uniqid = require('uniqid');

const executeCode = async (req, res) => {
  const { code, language } = req.body;
  // First writing to file
  if (!code) return res.status(400).send('No code provided');
  if (!language) return res.status(400).send('No language provided');
  if (!['c++', 'javascript', 'python'].includes(language))
    return res.status(400).send('Invalid language');

  let fileName = uniqid();
  if (language === 'c++') fileName += '.cpp';
  else if (language === 'javascript') fileName += '.js';
  else if (language === 'python') fileName += '.py';

  let fileDir = `./scripts/${fileName}`;
  fs.writeFile(fileDir, code, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
  exec(
    `sh ./util/execution-${language}.sh ${fileName}`,
    (err, stdout, stderr) => {
      fs.rm(fileDir, (error) => {
        if (error) console.log(error);
        if (err) {
          return res.send({ status: 'error', output: stderr });
        }
        res.send({ status: 'success', output: stdout });
      });
    }
  );
};

module.exports = { executeCode };
