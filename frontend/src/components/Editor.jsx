import { useState, useEffect, useRef, Component } from 'react';
import '../css/Editor.css';
import { textDiff } from '../utils';
import Text from '../modules/Text';
import Block from '../modules/Block';
import Article from '../modules/Article';
import { useStatus } from '../hook/useStatus';
import { List } from 'immutable';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  genKey,
  ContentState,
  ContentBlock,
  getDefaultKeyBinding,
  SelectionState,
  Modifier,
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
        setEditorState((editorState) => {
          console.log(event);
          const blockId = event.block;
          const targetBlock = content.getBlockFromId(blockId);
          const blockNum = content.idToRowNum(blockId);
          const blocks = editorState.getCurrentContent().getBlocksAsArray();
          const selection = editorState.getSelection();
          let newSelection = {
            anchorKey: selection.getAnchorKey(),
            anchorOffset: selection.getAnchorOffset(),
            focusKey: selection.getFocusKey(),
            focusOffset: selection.getFocusOffset(),
            isBackward: selection.isBackward,
          };
          let newRaws = convertToRaw(editorState.getCurrentContent());
          let newContent = null;
          let deleteNum = 0;
          if (event && event.type === 'insert') {
            Text.updateClock(event.target.clock);
            targetBlock.insertKey({ ...event, fromOutside: true });
            newRaws.blocks[blockNum].text = targetBlock.getContent();
            newContent = convertFromRaw(newRaws);
          } else if (event && event.type === 'insertMultiple') {
            console.log('insertMultiple');
            targetBlock.insertMultiple({ ...event, fromOutside: true });
            newRaws.blocks[blockNum].text = targetBlock.getContent();
            newContent = convertFromRaw(newRaws);
          } else if (event && event.type === 'delete') {
            targetBlock.deleteKey(event);
            newRaws.blocks[blockNum].text = targetBlock.getContent();
            newContent = convertFromRaw(newRaws);
          } else if (event && event.type === 'deleteMultiple') {
            deleteNum = targetBlock.deleteMultiple({
              target: event.target,
              currentCursor: newSelection.anchorOffset,
            });
            newRaws.blocks[blockNum].text = targetBlock.getContent();
            newContent = convertFromRaw(newRaws);
          } else if (event && event.type === 'changeStyle') {
            targetBlock.style = event.style;
            newRaws.blocks[blockNum].type = targetBlock.style;
            newContent = convertFromRaw(newRaws);
          } else if (event && event.type === 'createBlock') {
            const block = content.createBlock({ ...event, fromOutside: true });
            const newBlock = new ContentBlock({
              key: genKey(),
              type: 'unstyled',
              text: '',
              depth: 0,
              characterList: List(),
            });
            blocks.splice(block + 1, 0, newBlock);
            newContent = ContentState.createFromBlockArray(blocks);
          } else if (event && event.type === 'removeBlock') {
            const targetBlock = event.target;
            content.removeBlock(targetBlock);
            const blockIndex = content.idToRowNum(targetBlock);
            blocks.splice(blockIndex, 1);
            newContent = ContentState.createFromBlockArray(blocks);
          } else {
            console.log('unknown event');
            return;
          }
          // TODO: need to handle when the user select from back to front
          const currentBlockIndex = editorState
            .getCurrentContent()
            .getBlockMap()
            .keySeq()
            .findIndex((k) => k === newSelection.anchorKey);
          if (blockNum === currentBlockIndex) {
            if (event.type === 'removeBlock') {
              newSelection.anchorKey = newRaws.blocks[blockNum - 1].key;
              newSelection.focusKey = newRaws.blocks[blockNum - 1].key;
              newSelection.anchorOffset +=
                newRaws.blocks[blockNum - 1].text.length;
              newSelection.focusOffset +=
                newRaws.blocks[blockNum - 1].text.length;
            } else if (
              event.cursor < newSelection.anchorOffset ||
              (event.cursor === newSelection.anchorOffset && event.rowDiff <= 0)
            ) {
              newSelection.anchorOffset += event.rowDiff;
              newSelection.focusOffset += event.rowDiff;
            } else if (event.cursor > newSelection.anchorOffset && deleteNum) {
              newSelection.anchorOffset -= deleteNum;
              newSelection.focusOffset -= deleteNum;
            }
          }

          return EditorState.forceSelection(
            EditorState.createWithContent(newContent),
            new SelectionState(newSelection)
          );
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
    console.log(newRaws);
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
            cursor: null,
          });
        }
        handleSingleBlockEditing(
          newRaws.blocks[startBlockIndex].text,
          startIndex,
          startBlockIndex
        );
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
        rowDiff: 1,
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
        rowDiff: diff.target.length,
        prev: diff.prev.toString(),
        next: diff.next.toString(),
        block: targetBlock.uId,
      });
    } else if (diff && diff.type === 'delete') {
      targetBlock.deleteKey(diff);
      socket.emit('editEvent', {
        ...diff,
        block: targetBlock.uId,
        rowDiff: -1,
        target: diff.target.toString(),
      });
    } else if (diff && diff.type === 'deleteMultiple') {
      const target = diff.target.map((i) => i.toString());
      targetBlock.deleteMultiple(diff);
      socket.emit('editEvent', {
        ...diff,
        block: targetBlock.uId,
        target,
        rowDiff: -diff.target.length,
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
    console.log(inlineStyle);
    console.log(
      convertToRaw(
        RichUtils.toggleInlineStyle(
          editorState,
          inlineStyle
        ).getCurrentContent()
      )
    );
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const keyBindingFn = (e) => {
    // TODO: Maybe I can control event by myself here
    const startBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === editorState.getSelection().getStartKey());
    const selectionState = editorState.getSelection();
    const startIndex = selectionState.getStartOffset();
    const endIndex = selectionState.getEndOffset();
    let raws = convertToRaw(editorState.getCurrentContent());
    if (e.key === 'Enter') {
      const newText = raws.blocks[startBlockIndex].text.slice(0, startIndex);
      // First handle the previous block
      handleSingleBlockEditing(newText, startIndex, startBlockIndex);
      let newId = content.createBlock({ startBlockIndex });
      socket.emit('editEvent', {
        type: 'createBlock',
        target: { uId: newId },
        block: content.rowNumToId(startBlockIndex),
        blockDiff: 1,
        cursor: startIndex,
        prev: content.getBlock(startBlockIndex).toString(),
        next: Article.getNextBlock(
          content.getBlock(startBlockIndex)
        ).toString(),
      });
    } else if (
      e.key === 'Backspace' &&
      startIndex === 0 && // if cursor is at the start of the block
      startBlockIndex !== 0 && // if cursor is not at the start of the first block
      raws.blocks[startBlockIndex].type === 'unstyled' && // This is not remove style
      endIndex === 0
    ) {
      let targetBlock = content.rowNumToId(startBlockIndex);
      content.removeBlock(targetBlock);
      socket.emit('editEvent', {
        type: 'removeBlock',
        target: targetBlock,
        cursor: startIndex,
        block: targetBlock,
        blockDiff: -1,
      });
    }
    return getDefaultKeyBinding(e);
  };

  const focus = () => {
    editorRef.current.focus();
  };

  return (
    <div className="RichEditor-root">
      <button
        onClick={() => {
          setEditorState((prevEditorState) => {
            let newContent = Modifier.replaceText(
              editorState.getCurrentContent(),
              prevEditorState.getSelection(),
              'this is a test'
            );
            let newState = EditorState.push(
              editorState,
              newContent,
              'insert-characters'
            );
            let selection = prevEditorState.getSelection();
            let blocks = prevEditorState.getCurrentContent().getBlocksAsArray();
            return EditorState.forceSelection(
              newState,
              // selection
              new SelectionState({
                anchorKey: selection.getAnchorKey(),
                anchorOffset: selection.getAnchorOffset(),
                focusKey: selection.getFocusKey(),
                focusOffset: selection.getFocusOffset(),
                isBackward: selection.isBackward,
              })
            );
          });
        }}>
        Click me
      </button>
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
