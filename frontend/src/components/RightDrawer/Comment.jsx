import { Fragment, useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Divider,
  ButtonBase,
  Avatar,
  TextField,
  Button,
} from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import { useStatus } from '../../hook/useStatus';
import { timeSince } from '../../utils';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ReplyIcon from '@mui/icons-material/Reply';

const Comment = () => {
  const { request, note, otherNotesPermission } = useStatus();
  const [comments, setcomments] = useState([]);
  const [comment, setComment] = useState('');
  const [currentComments, setCurrentComments] = useState([]);
  const testComments = [
    // { comment: 'This is the best article I have seen!', date: '' },
    // { comment: 'Terrific!', date: '' },
    // { comment: 'Excellent', date: '' },
  ];

  useEffect(() => {
    const fetchComments = async () => {
      if (request && note.id) {
        let res = await request.getComments(note.id);
        const { comments } = res.data;
        console.log(comments);
        setCurrentComments(comments);
      }
    };
    fetchComments();
  }, [request, note]);
  useEffect(() => {
    console.log(otherNotesPermission);
  }, [otherNotesPermission]);
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      {currentComments.length ? (
        <Box>
          <Box
            sx={{
              width: '100%',
              padding: '15px',
              paddingTop: '79px',
              position: 'fixed',
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
            {currentComments.map((comment, i) => {
              return (
                <ButtonBase
                  key={i}
                  sx={{ width: '100%', borderBottom: '1px solid #E0E0E0' }}>
                  <Grid container sx={{ padding: '15px' }}>
                    <Grid item xs={12} md={2}>
                      <Avatar
                        sx={{ border: '1px solid #E0E0E0' }}
                        src={`//joeschmoe.io/api/v1/${comment.name}`}
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
                        overflow: 'hidden',
                      }}>
                      <Typography
                        variant="h8"
                        sx={{ marginBottom: '5px', textAlign: 'left' }}>
                        {comment.comment}
                      </Typography>
                      <Typography variant="h8" sx={{ color: 'gray' }}>
                        {timeSince(comment.createdAt)}
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
      <Box>
        <Divider />
        <Grid
          container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px',
            marginTop: '20px',
          }}>
          <Grid item xs={12} md={1}></Grid>
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 'auto',
            }}>
            <TextField
              style={{ width: '100%' }}
              color="secondary"
              placeholder={
                otherNotesPermission.status &&
                !otherNotesPermission.permission.allowComment
                  ? 'The Author not allow to comment'
                  : 'Leave a comment'
              }
              disabled={
                otherNotesPermission.status &&
                !otherNotesPermission.permission.allowComment
              }
              inputProps={{
                style: {
                  fontSize: 15,
                  height: 5,
                  backgroundColor: '#F2F2F2',
                },
              }}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
              }}></TextField>
          </Grid>
          <Grid item xs={12} md={0.5}></Grid>
          <Grid item xs={12} md={3}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={
                otherNotesPermission.status &&
                !otherNotesPermission.permission.allowComment
              }
              sx={{
                '&:hover': {
                  backgroundColor: '#EDF4F3',
                },
              }}
              onClick={async () => {
                let res = await request.createComment(note.id, comment);
                let { name, createdAt, _id } = res.data;
                setCurrentComments((prev) => [
                  { comment, name, createdAt, _id },
                  ...prev,
                ]);
                setComment('');
              }}>
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Comment;
