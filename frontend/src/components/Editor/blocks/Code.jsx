import { EditorBlock } from 'draft-js';
import { Box, IconButton, Grid, Fade } from '@mui/material';
import { useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  const execCode = async (e) => {
    const codeBlock =
      e.target.parentElement.parentElement.parentElement.parentElement
        .parentElement.parentElement;
    const codes = codeBlock.querySelectorAll('section.code');
    let codeText = '';
    codes.forEach((code) => {
      codeText += code.children[0].innerText + '\n';
    });
    let res = await axios.post('http://localhost:3000/api/1.0/code', {
      code: codeText,
    });
    console.log(res);
    setCodeResult(res.data.output);
  };
  return (
    <Box
      sx={{ position: 'relative' }}
      onMouseEnter={() => setShowFunc(true)}
      onMouseLeave={() => setShowFunc(false)}>
      <Fade in={showFunc}>
        <Grid
          container
          sx={{
            position: 'absolute',
            top: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            transform: 'translateY(3px)',
            transition: 'all 10s ease',
          }}>
          <Grid item xs={12} md={0.25}></Grid>
          <Grid item xs={12} md={2}>
            <select id="language-selection">
              <option value="javascript">Javascript</option>
              <option value="python">Python</option>
              <option value="c++">C++</option>
            </select>
          </Grid>
          <Grid item xs={12} md={8}></Grid>
          <Grid item xs={12} md={1.5}>
            <Box
              contentEditable={false}
              readOnly
              className="exec-btns"
              sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <IconButton
                onClick={(e) => {
                  execCode(e);
                }}>
                <PlayArrowIcon />
              </IconButton>
              <IconButton>
                <ContentCopyIcon />
              </IconButton>
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Fade>
      <div className="public-DraftStyleDefault-pre" {...props}></div>
      <Box className="code-result" contentEditable={false} readOnly>
        {codeResult}
      </Box>
    </Box>
  );
};

export { Code, CodeWrapper };
