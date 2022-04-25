import { Grid, TextField, Button, Switch, Collapse } from '@mui/material';
import { useStatus } from '../../hook/useStatus';
import { useSnackbar } from '../../hook/useSnackbar';
const Invite = () => {
  const { note } = useStatus();
  const { showMessage } = useSnackbar();

  return (
    <Collapse in={note.permission.openToPublic}>
      <Grid
        container
        sx={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
        <Grid item xs={12} md={0.25}></Grid>
        <Grid
          item
          xs={12}
          md={9.25}
          sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            style={{ width: '100%' }}
            placeholder={`https://tristan.network/notes/${note.url}`}
            inputProps={{
              style: {
                fontSize: 10,
                height: 5,
                boxSizing: 'border-box',
                width: '100%',
                backgroundColor: '#F2F2F2',
              },
              readOnly: true,
            }}></TextField>
        </Grid>
        <Grid item xs={12} md={0.25}></Grid>
        <Grid item xs={12} md={1.75}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            sx={{
              '&:hover': {
                backgroundColor: '#EDF4F3',
              },
            }}
            onClick={() => {
              navigator.clipboard.writeText(
                `${process.env.REACT_APP_DOMAIN}/notes/${note.url}`
              );
              showMessage('Copied to clipboard');
            }}>
            COPY
          </Button>
        </Grid>
      </Grid>
      {['Allow Editing', 'Allow Comments', 'Allow Duplicate as template'].map(
        (item, index) => {
          return <Permission type={item} key={index} />;
        }
      )}
    </Collapse>
  );
};

const Permission = ({ type }) => {
  const { note, setNote, request } = useStatus();

  return (
    <Grid
      container
      sx={{
        padding: '3px 10px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',

        '&:hover': {
          backgroundColor: '#F2F2F2',
        },
      }}
      onClick={async () => {
        if (type === 'Allow Editing') {
          await request.alterPublicPermission(note.id, {
            target: 'allowEdit',
            value: !note.permission.allowEdit,
          });
          setNote({
            ...note,
            permission: {
              ...note.permission,
              allowEdit: !note.permission.allowEdit,
            },
          });
        } else if (type === 'Allow Comments') {
          await request.alterPublicPermission(note.id, {
            target: 'allowComment',
            value: !note.permission.allowComment,
          });
          setNote({
            ...note,
            permission: {
              ...note.permission,
              allowComment: !note.permission.allowComment,
            },
          });
        } else {
          await request.alterPublicPermission(note.id, {
            target: 'allowDuplicate',
            value: !note.permission.allowDuplicate,
          });
          setNote({
            ...note,
            permission: {
              ...note.permission,
              allowDuplicate: !note.permission.allowDuplicate,
            },
          });
        }
      }}>
      <Grid item xs={12} md={0.25}></Grid>
      <Grid item xs={12} md={9.75}>
        {type}
      </Grid>
      <Grid item xs={12} md={1.5}>
        <Switch
          checked={
            !note.permission
              ? false
              : type === 'Allow Editing'
              ? note.permission.allowEdit
              : type === 'Allow Comments'
              ? note.permission.allowComment
              : note.permission.allowDuplicate
          }
          color="secondary"
        />
      </Grid>
    </Grid>
  );
};

export default Invite;
