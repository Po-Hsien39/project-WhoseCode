const fs = require('fs');
const { exec } = require('child_process');
const uniqid = require('uniqid');

const executeCode = async (req, res) => {
  const { code } = req.body;
  // First writing to file
  if (!code) return res.status(400).send('No code provided');
  let fileName = uniqid();
  let fileDir = `./scripts/${fileName}.js`;
  fs.writeFile(fileDir, code, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
  exec(`sh ./util/execution.sh ${fileName}.js`, (err, stdout, stderr) => {
    fs.rm(fileDir, (error) => {
      if (error) console.log(error);
      if (err) {
        return res.send({ status: 'error', output: stderr });
      }
      res.send({ status: 'success', output: stdout });
    });
  });
};

module.exports = { executeCode };
