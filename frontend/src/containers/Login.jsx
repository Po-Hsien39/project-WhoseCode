import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../hook/useSnackbar';
import { useStatus } from '../hook/useStatus';
import Input from '../components/Login/Input';
import Background from '../assets/background.png';
import BottomBackground from '../assets/background2.png';

const Login = () => {
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const { user, setUser, request, redirectUrl } = useStatus();
  const [values, setValues] = useState({
    name: undefined,
    email: undefined,
    password: undefined,
    confirmPassword: undefined,
    showPassword: false,
  });

  const { showMessage } = useSnackbar();
  useEffect(() => {
    const input = document.querySelectorAll('input');
    input.forEach((i) =>
      i.addEventListener('keydown', (e) => e.stopPropagation())
    );
  }, []);

  useEffect(() => {
    if (user.login) {
      showMessage(`Hello ${user.name}~ Happing Noting!`);
      navigate('/');
    }
  }, [user]);

  useEffect(() => {
    setValues((values) => ({ ...values, showPassword: false }));
  }, [signup]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirmPassword) {
      setWrongPassword(true);
    } else {
      setWrongPassword(false);
      try {
        let res = await request.signUp(
          values.name,
          values.email,
          values.password
        );
        // Save Local Storage
        window.localStorage.setItem('token', res.data.data.access_token);
        setUser({
          id: res.data.data.user.id,
          name: values.name,
          email: values.email,
          login: true,
        });
        showMessage(`Hello ${values.name}~ Happy Noting!`, 'success', 2000);
        if (redirectUrl && redirectUrl.startsWith('/notes/'))
          navigate(redirectUrl);
        else navigate('/');
      } catch (err) {
        console.log(err.code);
        showMessage(err.response.data.error, 'error', 2000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await request.nativeSignIn(values.email, values.password);
      const { user, access_token } = res.data.data;
      // Save Local Storage
      window.localStorage.setItem('token', access_token);
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        login: true,
      });
      showMessage(`Hello ${user.name}~ Happy Noting!`, 'success', 2000);
      if (redirectUrl && redirectUrl.startsWith('/notes/')) {
        navigate(redirectUrl);
      } else navigate('/');
    } catch (err) {
      showMessage('Wrong Email or Password, Please try again', 'error', 2000);
    }
  };

  const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    width: 'min(300px, 90vw)',
    height: 'calc(100vh - 64px)',
    paddingTop: '34px',
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  return (
    <div align="center" style={style}>
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
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {signup && (
          <Input //
            name="name"
            label="Name"
            handlechange={handleChange}
            type="text"
            autoFocus
          />
        )}
        <Input //
          name="email"
          label="Email"
          handlechange={handleChange}
          type="email"
          autoFocus
        />
        <Input //
          // error={true}
          // helperText='Your email do not match!'
          name="password"
          label="Password"
          handlechange={handleChange}
          type={values.showPassword ? 'text' : 'password'}
          handleShowPassword={handleClickShowPassword}
        />
        {signup && (
          <Input //
            error={wrongPassword}
            helperText={wrongPassword ? "Your Password doen't match!" : ''}
            name="confirmPassword"
            label="Confirm Password"
            handlechange={handleChange}
            type={values.showPassword ? 'text' : 'password'}
            handleShowPassword={handleClickShowPassword}
          />
        )}
        {signup ? (
          <Button
            type="submit"
            color="primary"
            variant="contained"
            onClick={handleSignUp}
            fullWidth
            sx={{
              my: 1,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary',
              },
            }}>
            Signup
          </Button>
        ) : (
          <>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              sx={{
                my: 1,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'primary',
                },
              }}>
              Login
            </Button>
          </>
        )}
      </form>
      <Button
        variant="text"
        color="secondary"
        onClick={() => setSignup(!signup)}
        sx={{ fontSize: (theme) => theme.typography.caption.fontSize }}>
        {signup
          ? 'Already have an account? Log in!'
          : "Don't have an account? Sign up!"}
      </Button>
    </div>
  );
};

export default Login;
