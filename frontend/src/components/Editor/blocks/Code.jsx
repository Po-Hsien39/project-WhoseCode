import { EditorBlock } from 'draft-js';
import { Box, IconButton, Grid, Fade, Tooltip } from '@mui/material';
import { useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from '../../../hook/useSnackbar';
import copy from 'copy-text-to-clipboard';
import axios from 'axios';

const Code = (props) => {
  return (
    <section className="code">
      <EditorBlock {...props} />
    </section>
  );
};

const CodeWrapper = (props) => {
  const [showFunc, setShowFunc] = useState(false);
  const [codeResult, setCodeResult] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const { showMessage } = useSnackbar();

  const getCode = async (e) => {
    const svg = e.target.parentElement.parentElement.querySelector('svg');
    const codeBlock =
      svg.parentElement.parentElement.parentElement.parentElement.parentElement;

    const codes = codeBlock.querySelectorAll('section.code');
    let codeText = '';
    codes.forEach((code) => {
      codeText += code.children[0].innerText + '\n';
    });
    return codeText;
  };

  const execCode = async (e) => {
    setExecuting(true);
    const codeBlock = await getCode(e);
    console.log(codeBlock);
    let res = await axios.post('http://localhost:3000/api/1.0/code', {
      code: codeBlock,
      language: codeLanguage,
    });
    setCodeResult(res.data.output);
  };

  const copyCode = async (e) => {
    const code = await getCode(e);
    copy(code);
    setCopied(true);
    showMessage('Copy Successfully');
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const saveCode = async (e) => {
    const code = await getCode(e);
    let file;
    if (codeLanguage === 'javascript') {
      file = new File([code], 'whoseCode.js', {
        type: 'text/javascript',
      });
    } else if (codeLanguage === 'python') {
      file = new File([code], 'whoseCode.py', {
        type: 'text/python',
      });
    }
    download(file);
  };

  function download(file) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <Box
      sx={{
        position: 'relative',
        marginBottom: '20px',
        // marginTop: '20px',
        zIndex: 100,
        // display: props.delete ? 'none' : 'block',
      }}
      onMouseEnter={() => setShowFunc(true)}
      onMouseLeave={() => setShowFunc(false)}>
      <Fade in={showFunc}>
        <Grid
          container
          wrap="nowrap"
          sx={{
            position: 'absolute',
            top: 0,
            width: '100%',
            display: props.delete ? 'none' : 'flex',
            alignItems: 'center',
            transform: 'translateY(3px)',
            transition: 'all 10s ease',
          }}>
          {/* <Grid item xs={12} md={0.5}></Grid> */}
          <Grid item xs={12} md={2} sx={{ marginLeft: '20px' }}>
            <select
              id="language-selection"
              onChange={(e) => setCodeLanguage(e.target.value)}>
              value={codeLanguage}
              <option value="javascript">Javascript</option>
              <option value="python">Python</option>
              <option value="c++">C++</option>
            </select>
          </Grid>
          <Grid item xs={12} md={7.75}></Grid>
          <Grid item xs={12} md={1.5}>
            <Box
              contentEditable={false}
              readOnly
              className="exec-btns"
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
              }}>
              <Tooltip title="Run Code" placement="top">
                <IconButton onClick={(e) => execCode(e)}>
                  <PlayArrowIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={copied ? 'Copied' : 'Copy'} placement="top">
                <IconButton onClick={(e) => copyCode(e)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download" placement="top">
                <IconButton onClick={(e) => saveCode(e)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Fade>
      <div
        className={
          props.delete ? 'code-block-hide' : 'public-DraftStyleDefault-pre'
        }
        {...props}></div>
      {executing ? (
        <Box
          className="code-result"
          contentEditable={false}
          readOnly
          style={{
            backgroundColor: '#f2f2f2',
            marginTop: '5px',
            padding: '10px',
            maxHeight: '200px',
            overflow: 'auto',
            color: 'black',
          }}>
          {codeResult}
        </Box>
      ) : null}
    </Box>
  );
};

export { Code, CodeWrapper };
