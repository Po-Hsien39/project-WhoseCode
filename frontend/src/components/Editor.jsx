import { useState, useEffect, useRef, Component } from 'react';
import '../css/Editor.css';
import { textDiff } from '../utils';
import Text from '../modules/Text';
import Block from '../modules/Block';
import Article from '../modules/Article';
import { useStatus } from '../hook/useStatus';
import { List, Repeat } from 'immutable';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  genKey,
  ContentState,
  ContentBlock,
  CharacterMetadata,
  getDefaultKeyBinding,
} from 'draft-js';

const DraftJSRichTextEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [content, setContent] = useState(null);
  const { socket } = useStatus();
  const editorRef = useRef(null);

  useEffect(() => {
    setContent(new Article());
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('joinRoom');
      socket.on('newEvent', (event) => {
        console.log(event);
        const blockId = event.block;
        const targetBlock = content.getBlockFromId(blockId);
        if (event && event.type === 'insert') {
          Text.updateClock(event.target.clock);
          targetBlock.insertKey({ ...event, fromOutside: true });
        } else if (event && event.type === 'insertMultiple') {
          targetBlock.insertMultiple({ ...event, fromOutside: true });
        } else if (event && event.type === 'delete') {
          targetBlock.deleteKey(event);
        } else if (event && event.type === 'deleteMultiple') {
          targetBlock.deleteMultiple(event);
        } else if (event && event.type === 'changeStyle') {
          targetBlock.style = event.style;
        } else if (event && event.type === 'createBlock') {
          const block = content.createBlock({ ...event, fromOutside: true });
          const newBlock = new ContentBlock({
            key: genKey(),
            type: 'unstyled',
            text: '',
            depth: 0,
            characterList: List(),
          });
          setEditorState((editorState) => {
            const blocks = editorState.getCurrentContent().getBlocksAsArray();
            blocks.splice(block + 1, 0, newBlock);
            let newContent = ContentState.createFromBlockArray(blocks);
            return EditorState.forceSelection(
              EditorState.createWithContent(newContent),
              editorState.getSelection()
            );
          });
          return;
        } else if (event && event.type === 'removeBlock') {
          const targetBlock = event.target;
          content.removeBlock(targetBlock);
          const blockIndex = content.idToRowNum(targetBlock);
          setEditorState((editorState) => {
            const blocks = editorState.getCurrentContent().getBlocksAsArray();
            blocks.splice(blockIndex, 1);
            const newContent = ContentState.createFromBlockArray(blocks);
            return EditorState.createWithContent(newContent);
          });
          return;
        } else {
          console.log('unknown event');
          return;
        }
        setEditorState((prev) => {
          let newRaws = convertToRaw(prev.getCurrentContent());
          let blockNum = content.idToRowNum(blockId);
          newRaws.blocks[blockNum].text = targetBlock.getContent();
          newRaws.blocks[blockNum].type = targetBlock.style;
          const editor = EditorState.createWithContent(convertFromRaw(newRaws));
          return EditorState.forceSelection(editor, prev.getSelection());
        });
      });
    }
  }, [socket]);

  const onChange = (editorState) => {
    const startBlockKey = editorState.getSelection().getStartKey();
    const endBlockKey = editorState.getSelection().getEndKey();
    const startBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === startBlockKey);
    const endBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === endBlockKey);
    let newRaws = convertToRaw(editorState.getCurrentContent());
    const blocksNum = newRaws.blocks.length;
    let selectionState = editorState.getSelection();
    const startIndex = selectionState.getStartOffset();
    const endIndex = selectionState.getEndOffset();
    // This is the single block operation
    if (startBlockIndex === endBlockIndex) {
      if (blocksNum !== content.blockLength()) {
        // handleBlockChange(editorState);
        handleBlockChanges();
      } else {
        if (
          !Block.compareStyle(
            content.getBlock(startBlockIndex).style,
            newRaws.blocks[startBlockIndex].type
          )
        ) {
          content.getBlock(startBlockIndex).style =
            newRaws.blocks[startBlockIndex].type;
          socket.emit('editEvent', {
            style: content.getBlock(startBlockIndex).style,
            type: 'changeStyle',
            block: content.getBlock(startBlockIndex).uId,
          });
        } else {
          handleSingleBlockEditing(
            newRaws.blocks[startBlockIndex].text,
            startIndex,
            startBlockIndex
          );
        }
      }
    }
    const editor = EditorState.createWithContent(convertFromRaw(newRaws));
    setEditorState(EditorState.forceSelection(editor, selectionState));
  };

  const resetEditor = (newRaws) => {
    newRaws.blocks[0].text = content.getContent();
    newRaws.blocks[0].type = content.style;
    return newRaws;
  };
  const handleBlockChanges = () => {};
  const handleSingleBlockEditing = (newText, sIndex, blockIndex) => {
    let targetBlock = content.getBlock(blockIndex);
    const diff = textDiff(targetBlock, newText, sIndex);
    // Sending Diff to server
    if (diff && diff.type === 'insert') {
      targetBlock.insertKey(diff);
      socket.emit('editEvent', {
        ...diff,
        block: targetBlock.uId,
        prev: diff.prev.toString(),
        target: diff.target.toString(),
        next: diff.next.toString(),
      });
    } else if (diff && diff.type === 'insertMultiple') {
      targetBlock.insertMultiple(diff);
      const target = diff.target.map((i) => i.toString());
      socket.emit('editEvent', {
        ...diff,
        target,
        prev: diff.prev.toString(),
        next: diff.next.toString(),
        block: targetBlock.uId,
      });
    } else if (diff && diff.type === 'delete') {
      targetBlock.deleteKey(diff);
      socket.emit('editEvent', {
        block: targetBlock.uId,
        target: diff.target.toString(),
        type: 'delete',
      });
    } else if (diff && diff.type === 'deleteMultiple') {
      const target = diff.target.map((i) => i.toString());
      targetBlock.deleteMultiple(diff);
      socket.emit('editEvent', {
        block: targetBlock.uId,
        target,
        type: 'deleteMultiple',
      });
    } else {
      console.log('No status');
    }
  };

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
    console.log('change');
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const keyBindingFn = (e) => {
    // TODO: Maybe I can control event by myself here
    const startBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === editorState.getSelection().getStartKey());
    if (e.key === 'Enter') {
      const selectionState = editorState.getSelection();
      const startIndex = selectionState.getStartOffset();
      let raws = convertToRaw(editorState.getCurrentContent());
      const newText = raws.blocks[startBlockIndex].text.slice(0, startIndex);
      // First handle the previous block
      handleSingleBlockEditing(newText, startIndex, startBlockIndex);

      let newId = content.createBlock({ startBlockIndex });
      socket.emit('editEvent', {
        type: 'createBlock',
        target: { uId: newId },
        prev: content.getBlock(startBlockIndex).toString(),
        next: Article.getNextBlock(
          content.getBlock(startBlockIndex)
        ).toString(),
      });
    } else if (
      e.key === 'Backspace' &&
      editorState.getSelection().getStartOffset() === 0 && // if cursor is at the start of the block
      startBlockIndex !== 0 // if cursor is not at the start of the first block
    ) {
      let targetBlock = content.rowNumToId(startBlockIndex);
      content.removeBlock(targetBlock);
      socket.emit('editEvent', {
        type: 'removeBlock',
        target: targetBlock,
      });
    }
    return getDefaultKeyBinding(e);
  };

  const focus = () => {
    editorRef.current.focus();
  };

  return (
    <div className="RichEditor-root">
      <button>Click me</button>
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
          keyBindingFn={keyBindingFn}
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
      return 'blockStyle';
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

const INLINE_STYLES = [
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
