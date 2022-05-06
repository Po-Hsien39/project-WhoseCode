import { Typography, Box, Modal, Divider, Button } from '@mui/material';
import { useStatus } from '../../hook/useStatus';
import { stateToHTML } from 'draft-js-export-html';
import html2canvas from 'html2canvas';
import jsPdf from 'jspdf';
import { useEffect } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Export({ open, setOpen }) {
  const { editorState } = useStatus();
  const handleClose = () => setOpen(false);
  const options = {
    blockRenderers: {
      'code-block': (block) => {
        return (
          '<pre style="font-size: 15px; background-color: #f2f2f2; margin: 0; padding: 3px 0;"><code>' +
          block.getText() +
          '</code></pre>'
        );
        // }
      },
    },
  };
  const printDocument = () => {
    const input = document.querySelector(
      // '.notranslate .public-DraftEditor-content'
      '.public-DraftEditor-content'
    );
    html2canvas(input).then((canvas) => {
      console.log(canvas);
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;
      // 一頁pdf顯示html頁面生成的canvas高度;
      var pageHeight = (contentWidth / 592.28) * 841.89;
      // 未生成pdf的html頁面高度
      var leftHeight = contentHeight;
      // 頁面偏移
      var position = 0;
      // a4紙的尺寸[595.28,841.89]，html頁面生成的canvas在pdf中圖片的寬高
      var imgWidth = 595.28;
      var imgHeight = (592.28 / contentWidth) * contentHeight;
      var pageData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPdf('', 'pt', 'a4');
      // 有兩個高度需要區分，一個是html頁面的實際高度，和生成pdf的頁面高度(841.89)
      // 當內容未超過pdf一頁顯示的範圍，無需分頁
      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          // 避免新增空白頁
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save('content.pdf');
    });
  };
  const getHtml = () => {
    let html = stateToHTML(editorState.getCurrentContent(), options);
    return html;
  };
  const saveHtml = async () => {
    let file = new File([getHtml()], 'notes.html');
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
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography fontWeight={'bold'} variant="h5">
            Export Notes
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ marginTop: '20px', marginBottom: '15px' }}>
          <Typography sx={{ color: '#598DEB' }} fontWeight="bold">
            You are going to export your notes to a file.
          </Typography>
          <Typography variant="h8">
            You can choose to export your notes as a PDF file or as a HTML file.
            <br />
            Which would you like to export?
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="tetiary"
            sx={{ marginRight: '15px', width: '120px' }}
            onClick={async () => {
              setOpen(false);
              await saveHtml();
            }}>
            HTML File
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              width: '120px',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary',
              },
            }}
            onClick={async () => {
              setOpen(false);
              await printDocument();
            }}>
            PDF File
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
