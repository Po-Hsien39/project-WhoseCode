import { Routes, Route } from 'react-router-dom';
import Welcome from './Welcome';
import Login from './Login';
import Notes from './Notes';

const Main = () => {
  return (
    <Routes>
      <Route path="/" element={<Welcome />}></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/notes" element={<Notes />}></Route>
    </Routes>
  );
};

export default Main;
