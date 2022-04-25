import { Routes, Route } from 'react-router-dom';
import Welcome from './Welcome';
import Login from './Login';
import Notes from './Notes';

const Main = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/notes/:id" element={<Notes />}></Route>
      <Route path="/" element={<Welcome />}></Route>
    </Routes>
  );
};

export default Main;
