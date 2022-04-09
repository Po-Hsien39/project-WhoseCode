import { useState, useEffect, useRef, Component } from 'react';
import '../css/Editor.css';
import { textDiff } from '../utils';
import Paragraph from '../modules/Paragraph';
import { useStatus } from '../hook/useStatus';
import Text from '../modules/Text';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';

const DraftJSRichTextEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [content, setContent] = useState(null);
  const { socket } = useStatus();
  const editorRef = useRef(null);

  useEffect(() => {
    setContent(new Paragraph());
    // socket.on('newEvent', (event) => {});
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('joinRoom');
      socket.on('newEvent', (event) => {
        if (event && event.type === 'insert') {
          Text.updateClock(event.target.clock);
          content.insertKey({ ...event, fromOutside: true });
        } else if (event && event.type === 'delete') {
          content.deleteKey(event);
        }
        setEditorState((prev) => {
          let newRaws = convertToRaw(prev.getCurrentContent());
          newRaws.blocks[0].text = content.getContent();
          const editor = EditorState.createWithContent(convertFromRaw(newRaws));
          return EditorState.forceSelection(editor, prev.getSelection());
        });
      });
    }
  }, [socket]);

  const onChange = (editorState) => {
    let newRaws = convertToRaw(editorState.getCurrentContent());
    let slectionState = editorState.getSelection();
    let newText = newRaws.blocks[0].text;
    handleEditing(newText, slectionState.getStartOffset());
    newRaws.blocks[0].text = content.getContent();
    const editor = EditorState.createWithContent(convertFromRaw(newRaws));
    setEditorState(EditorState.forceSelection(editor, slectionState));
  };

  const handleEditing = (newText, sIndex) => {
    const diff = textDiff(content, newText, sIndex);
    // Sending Diff to server
    if (diff && diff.type === 'insert') {
      content.insertKey(diff);
      socket.emit('editEvent', {
        ...diff,
        prev: diff.prev.toString(),
        target: diff.target.toString(),
        next: diff.next.toString(),
      });
    } else if (diff && diff.type === 'delete') {
      content.deleteKey(diff);
      socket.emit('editEvent', {
        target: diff.target.toString(),
        type: 'delete',
      });
    } else {
      console.log('No status');
    }
  };

  // const resetEditor = (event) => {
  //   if (event && event.type === 'insert') {
  //     content.insertKey(event);
  //   } else if (event && event.type === 'delete') {
  //     content.deleteKey(event);
  //   }
  //   currentRaws.blocks[0].text = content.getContent();
  //   const editor = EditorState.createWithContent(convertFromRaw(currentRaws));
  //   setEditorState(EditorState.forceSelection(editor, selectionState));
  // };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const onTab = (e) => {
    const maxDepth = 4;
    onChange(RichUtils.onTab(e, editorState, maxDepth));
  };

  const toggleBlockType = (blockType) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const focus = () => {
    editorRef.current.focus();
  };

  return (
    <div className="RichEditor-root">
      <BlockStyleControls
        editorState={editorState}
        onToggle={toggleBlockType}
      />
      <InlineStyleControls
        editorState={editorState}
        onToggle={toggleInlineStyle}
      />
      <div className={'RichEditor-editor'} onClick={focus}>
        <Editor
          blockStyleFn={getBlockStyle}
          customStyleMap={styleMap}
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          onTab={onTab}
          // placeholder="Tell a story..."
          ref={editorRef}
          spellCheck={true}
        />
      </div>
    </div>
  );
};

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}

class StyleButton extends Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

export default DraftJSRichTextEditor;
