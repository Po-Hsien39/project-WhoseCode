import { ReactComponent as MainSvg } from '../assets/taking-notes-animate.svg';
import Background from '../assets/background.png';
import BottomBackground from '../assets/background2.png';
import { Grid, Typography, Button, useTheme } from '@mui/material';
import { useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../hook/useStatus';

const Welcome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useStatus();
  useEffect(() => {
    if (user.login) {
      navigate('/notes');
    }
  }, [user]);

  return (
    <Grid
      sx={{
        position: 'relative',
        height: 'calc(100vh - 64px)',
        marginTop: '64px',
      }}>
      <img
        src={Background}
        style={{
          position: 'absolute',
          zIndex: -100,
          top: 0,
          right: 0,
          width: '800px',
        }}
      />
      <img
        src={BottomBackground}
        style={{
          position: 'absolute',
          zIndex: -100,
          bottom: 0,
          left: 0,
          width: '500px',
        }}
      />
      <MainSvg
        style={{
          width: '400px',
          position: 'absolute',
          right: '15%',
          top: '6%',
        }}
      />
      <Grid container sx={{ paddingTop: '160px' }}>
        <Grid item xs={12} md={1.5}></Grid>
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
          <Typography variant="h3" fontWeight={'bold'}>
            WhoseCode
          </Typography>
          <Typography
            variant="h6"
            sx={{ marginTop: '10px', marginBottom: '25px' }}>
            Best note taking app for engineers
          </Typography>
          <Typography variant="h7" sx={{ color: 'gray', lineHeight: 1.6 }}>
            This is a note taking app designed for engineers. <br />
            Allowing you to take notes and share them with your team, <br />
            You can see the differences between different version of your notes{' '}
            <br />
            most importantly, you can run code in your notes!
            {/* You can run your code within your notes. You can also collaborate
            with other engineers and see the different versions in your notes. */}
          </Typography>
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            sx={{
              marginTop: '40px',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}>
            {' '}
            Join Us Now
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Welcome;
