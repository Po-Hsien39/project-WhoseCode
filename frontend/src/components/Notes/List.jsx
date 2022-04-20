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

const List = ({ type, title, id }) => {
  const [onHover, setOnHover] = useState(false);
  const { setNote } = useStatus();

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
    console.log(type, id);
    if (type === 'note') {
      console.log('note');
      setNote({ id });
    } else if (title === 'Home') {
      setNote({ id: null });
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
