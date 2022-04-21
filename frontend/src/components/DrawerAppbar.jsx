import { AppBar as MuiAppBar } from '@mui/material';
import { styled } from '@mui/material/styles';
const drawerWidth = 240;
const drawerRight = 400;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open, rightopen }) => ({
  zIndex: 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open &&
    !rightopen && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  ...(rightopen &&
    !open && {
      width: `calc(100% - ${drawerRight}px)`,
      marginRight: `${drawerRight}px`,
      // marginLeft: `${drawerRight}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  ...(rightopen &&
    open && {
      width: `calc(100% - ${drawerRight + drawerWidth}px)`,
      marginRight: `${drawerRight}px`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
}));

export default AppBar;
