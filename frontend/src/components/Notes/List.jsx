import { Typography, Box, ButtonBase } from '@mui/material';
import {
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  AccessAlarm as AccessAlarmIcon,
  Delete as DeleteIcon,
  IosShare as IosShareIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useStatus } from '../../hook/useStatus';
import { useNavigate } from 'react-router-dom';

const List = ({ type, title, id, star, setRightopen, url }) => {
  const [onHover, setOnHover] = useState(false);
  const { setNote, note, setVersionNote, setDiffVersion, diffVersion } =
    useStatus();
  const navigate = useNavigate();
  const iconPicker = (text) => {
    if (text === 'Home') {
      return <HomeIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'Quick Find') {
      return <SearchIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'All Updates') {
      return (
        <AccessAlarmIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />
      );
    } else if (text === 'Setting') {
      return <SettingsIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'Trash') {
      return <DeleteIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else if (text === 'Export') {
      return <IosShareIcon sx={{ marginLeft: '15px', marginRight: '10px' }} />;
    } else {
      return null;
    }
  };

  const handleClick = () => {
    console.log(setRightopen);
    if (setRightopen) setRightopen(false);
    if (diffVersion.compare) {
      setDiffVersion({
        compare: false,
        diff: null,
        latest: null,
        showCurrent: false,
      });
    }
    if (type === 'note') {
      setVersionNote({ id: '', version: '', content: '' });
      setNote({ ...note, id, star, url });
      navigate(`/notes/${url}`);
    } else if (title === 'Home') {
      navigate('/notes/all');
    } else {
      console.log('Function not support');
    }
  };

  return (
    <ButtonBase sx={{ width: '100%' }} onClick={handleClick}>
      <Box
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          background:
            type === 'note' && note.id === id ? 'rgba(0, 0, 0, 0.08)' : 'white',
          alignItems: 'center',
          padding: '10px 0',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.08)',
          },
        }}>
        {iconPicker(title) || (
          <ArticleIcon
            size="small"
            fontSize="small"
            sx={{ marginLeft: '15px', marginRight: '10px' }}
          />
        )}
        <Typography
          sx={{
            textAlign: 'left',
            textOverflow: 'ellipsis',
            width: onHover && type === 'note' ? '150px' : '180px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}>
          {title || 'Untitled'}
        </Typography>
        {onHover && type === 'note' ? (
          <DeleteIcon
            size="small"
            fontSize="small"
            color="inherit"
            sx={{
              '&:hover': {
                color: '#d12317',
              },
            }}
          />
        ) : null}
      </Box>
    </ButtonBase>
  );
};

export default List;
