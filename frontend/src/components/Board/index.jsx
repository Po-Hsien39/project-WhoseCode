import {
  Box,
  Typography,
  Grid,
  Card,
  ButtonBase,
  AvatarGroup,
  Avatar,
  IconButton,
} from '@mui/material';
import Animate from './animate';
import { useStatus } from '../../hook/useStatus';
import { Home as HomeIcon } from '@mui/icons-material';
import Background from '../../assets/background.png';
import BottomBackground from '../../assets/background2.png';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { timeSince } from '../../utils';
import EmptySvg from '../../assets/empty.svg?component';
import { Add as AddIcon } from '@mui/icons-material';
import { useEffect } from 'react';

const Board = ({ createNote }) => {
  const { notes, user } = useStatus();

  return (
    <Grid
      sx={{ padding: '35px', height: '100%' }}
      // sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <img
        src={Background}
        style={{
          position: 'fixed',
          zIndex: -100,
          top: 0,
          right: 0,
          width: '800px',
        }}
      />
      <img
        src={BottomBackground}
        style={{
          position: 'fixed',
          zIndex: -100,
          bottom: 0,
          left: 0,
          width: '500px',
        }}
      />
      <Animate />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '25px',
        }}>
        <HomeIcon color="secondary" fontSize="large" />
        <Typography variant="h5" sx={{ marginLeft: '10px' }}>
          {`${user.name}'s Home`}
        </Typography>
      </Box>
      {notes.collect?.length ? (
        <>
          <Typography variant="h6" sx={{ marginTop: '45px' }}>
            Favorite Notes
          </Typography>
          <Box
            sx={{
              marginTop: '15px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '25px',
              position: 'relative',
              zIndex: 100,
            }}>
            {notes.collect
              ? notes.collect.map((note) => <Note key={note.id} note={note} />)
              : null}
          </Box>
        </>
      ) : null}
      {notes.private?.length ? (
        <>
          <Typography variant="h6" sx={{ marginTop: '35px' }}>
            Private Notes
          </Typography>
          <Box
            sx={{
              marginTop: '15px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '25px',
              position: 'relative',
              zIndex: 100,
            }}>
            {notes.private
              ? notes.private.map((note, i) => (
                  <Note key={note.id} note={note} />
                ))
              : null}
          </Box>
        </>
      ) : null}
      {!notes.private?.length && !notes.collect?.length ? (
        <>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <EmptySvg width="300px" style={{ marginTop: '5%' }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ marginRight: '15px' }}>
                No Any Note yet, create your first one!
              </Typography>
              <IconButton
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                  },
                }}
                onClick={createNote}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
        </>
      ) : null}
    </Grid>
  );
};

export default Board;

const Note = ({ note }) => {
  const { setNote, notes, user } = useStatus();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(notes);
  }, [notes]);

  return (
    <Box key={note.id}>
      <ButtonBase>
        <Card
          onClick={() => {
            setNote((note) => {
              return { ...note, id: note.id, star: note.star, url: note.url };
            });
            navigate(`/notes/${note.url}`);
          }}
          sx={{
            width: '300px',
            height: '180px',
            boxShadow: 3,
            boderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, .05)',
            ':hover': {
              boxShadow: 7,
            },
            padding: '15px',
          }}>
          <Grid container sx={{ display: 'flex', alignItems: 'center' }}>
            <Grid item xs={12} md={2}>
              <LocalOfferIcon fontSize="small" />
            </Grid>
            <Grid item xs={12} md={10} sx={{ textAlign: 'start' }}>
              <Typography>{note.title}</Typography>
            </Grid>
          </Grid>
          <Grid
            container
            sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
            <Grid item xs={12} md={2}>
              <AccessTimeIcon fontSize="small" />
            </Grid>
            <Grid item xs={12} md={8} sx={{ textAlign: 'start' }}>
              <Typography variant="h8">{`Created at: ${timeSince(
                note.createdAt
              )}`}</Typography>
            </Grid>
          </Grid>
          <Grid container sx={{ display: 'flex', alignItems: 'center' }}>
            <Grid item xs={12} md={2}></Grid>
            <Grid item xs={12} md={8} sx={{ textAlign: 'start' }}>
              <Typography variant="h8">{`Update at: ${timeSince(
                note.updatedAt
              )}`}</Typography>
            </Grid>
          </Grid>
          <Grid container sx={{ marginTop: '20px' }}>
            <Grid item xs={12} md={16}>
              <AvatarGroup
                max={4}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 30,
                    height: 30,
                    fontSize: 15,
                    backgroundColor: 'rgba(0, 0, 0, .3)',
                  },
                }}>
                <Avatar
                  alt="Travis Howard"
                  src={`//joeschmoe.io/api/v1/${user.name}`}
                />
                ;
                {note.permission.map((email) => {
                  return (
                    <Avatar
                      key={email}
                      alt="Travis Howard"
                      src={`//joeschmoe.io/api/v1/${email}`}
                    />
                  );
                })}
              </AvatarGroup>
            </Grid>
          </Grid>
        </Card>
      </ButtonBase>
    </Box>
  );
};
