import './App.css';
import Editor from './components/Editor';

function App() {
  // const [textContent, setTextContent] = useState(new Paragraph());
  // const [text, setText] = useState('');
  // const [pointer, setPointer] = useState(0);
  // useEffect(() => {
  // setPointer(document.querySelector('textarea').selectionStart);
  // document.querySelector('textarea').addEventListener('input', (e) => {
  //   console.log(e);
  // });
  // document.querySelector('textarea').addEventListener('change', (e) => {
  //   console.log(e);
  // });
  // document.querySelector('textarea').addEventListener('keydown', (e) => {
  //   if (e.code === 'Backspace') {
  //     console.log('del');
  //   }
  // });
  // document.getElementById('summernote').summernote();
  // });

  // useEffect(() => {
  //   console.log(pointer);
  // }, [pointer]);
  return <Editor />;
}

export default App;
