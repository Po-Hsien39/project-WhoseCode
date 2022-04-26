import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ButtonBase, Avatar } from '@mui/material/';
import { useStatus } from '../hook/useStatus';

const pages = ['Home', 'About', 'Contact'];
export default function MyAppBar() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useStatus();
  const changePage = (i) => {
    setCurrentPage(i);
  };

  useEffect(() => {
    if (user.login) {
      navigate('/');
    }
  }, [user]);

  return (
    <>
      <Box sx={{ flexGrow: 1, position: 'fixed', top: 0 }}>
        <AppBar>
          <Toolbar>
            <ButtonBase>
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{ display: { xs: 'none', sm: 'block' } }}>
                WhoseCode
              </Typography>
            </ButtonBase>

            <Box
              sx={{
                marginLeft: '60px',
                display: 'flex',
                alignItems: 'center',
              }}>
              {pages.map((page, i) => {
                return (
                  <Button
                    key={i}
                    onClick={() => changePage(i)}
                    sx={{
                      color:
                        i === currentPage ? 'primary.dark' : 'primary.light',
                      padding: '0 10px',
                      textAlign: 'center',
                    }}>
                    {page}
                  </Button>
                );
              })}
            </Box>
            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: '5', md: 'flex' } }}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                // aria-controls={menuId}
                aria-haspopup="true"
                color="inherit">
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                  }}
                  src={
                    user.login ? `//joeschmoe.io/api/v1/${user.name}` : ''
                  }></Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}
