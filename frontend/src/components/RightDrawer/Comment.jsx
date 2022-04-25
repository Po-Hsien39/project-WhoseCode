import { Fragment, useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Divider,
  ButtonBase,
  Avatar,
} from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';

const Comment = () => {
  const [comments, setcomments] = useState([]);

  const testComments = [
    { comment: 'This is the best article I have seen!', date: '' },
    { comment: 'Terrific!', date: '' },
    { comment: 'Excellent', date: '' },
  ];

  return (
    <Fragment>
      {testComments.length ? (
        <Box>
          <Box
            sx={{
              width: '100%',
              padding: '15px',
              paddingTop: '79px',
              position: 'fixed',
              // backgroundColor: '#fff',
            }}>
            <Typography variant="h8">Comments</Typography>
          </Box>
          <Box
            sx={{
              position: 'fixed',
              paddingTop: '118px',
              zIndex: 80,
              width: '100%',
            }}>
            <Divider />
          </Box>
          <Box sx={{ paddingTop: '118px' }}>
            {testComments.map((comment, i) => {
              return (
                <ButtonBase
                  key={i}
                  sx={{ width: '100%', borderBottom: '1px solid #E0E0E0' }}>
                  <Grid container sx={{ padding: '15px' }}>
                    <Grid item xs={12} md={2}>
                      <Avatar
                        sx={{ border: '1px solid #E0E0E0' }}
                        src={`//joeschmoe.io/api/v1/${
                          comment.name || 'Tristan'
                        }`}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={10}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                      }}>
                      <Typography variant="h8" sx={{ marginBottom: '5px' }}>
                        {comment.comment}
                      </Typography>
                      <Typography variant="h8" sx={{ color: 'gray' }}>
                        {'6 hours ago'}
                      </Typography>
                    </Grid>
                  </Grid>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MessageIcon size="large" fontSize="large" />
          <Typography variant="h6" sx={{ marginTop: '15px' }}>
            No comments yet
          </Typography>
          <Typography
            variant="h9"
            sx={{ marginTop: '15px', color: 'gray', textAlign: 'center' }}>
            Any open comment about this note <br /> will be shown here
          </Typography>
        </Box>
      )}
    </Fragment>
  );
};

export default Comment;
