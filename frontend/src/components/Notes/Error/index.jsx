import { Box, Typography, Button } from '@mui/material';
import { useStatus } from '../../../hook/useStatus';
import LockSvg from '../../../assets/403-error.svg?component';
import NotFoundSvg from '../../../assets/404-error.svg?component';
import { useNavigate } from 'react-router-dom';

const Denied = () => {
  const { user, otherNotesPermission, setOtherNotesPermission } = useStatus();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        marginTop: '6%',
      }}>
      {otherNotesPermission.blockedType === 'notfound' ? (
        <>
          <NotFoundSvg style={{ width: '400px' }} />
          <Typography variant="h6" fontWeight="bold">
            We have find out the whole world but counldn't find anything
          </Typography>
        </>
      ) : (
        <>
          <LockSvg style={{ width: '300px' }} />
          <Typography variant="h6" fontWeight="bold">
            Seems like you don't have the right to access this note...
          </Typography>
        </>
      )}
      <Button
        variant="contained"
        color="primary"
        sx={{
          marginTop: '20px',
          width: '150px',
          '&:hover': {
            backgroundColor: 'primary.main',
            color: 'primary',
          },
        }}
        onClick={() => {
          setOtherNotesPermission((prev) => ({
            ...prev,
            blocked: false,
            status: false,
          }));
          navigate(`/notes/all`);
        }}>
        Back to Home
      </Button>
    </Box>
  );
};

export default Denied;
