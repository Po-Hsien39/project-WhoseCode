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
          let newBlockKey;
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
            const newBlock = content.createBlock({
              ...event,
              fromOutside: true,
            });
            let newBlocks = createNewBlock(blocks, newBlock);
            newBlockKey = newBlocks[newBlock + 1].key;
            newContent = ContentState.createFromBlockArray(newBlocks);
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
          if (blockNum === currentBlockIndex && !event.stopHandleCursor) {
            if (event.type === 'removeBlock') {
              newSelection.anchorKey = newRaws.blocks[blockNum - 1].key;
              newSelection.focusKey = newRaws.blocks[blockNum - 1].key;
              newSelection.anchorOffset +=
                newRaws.blocks[blockNum - 1].text.length;
              newSelection.focusOffset +=
                newRaws.blocks[blockNum - 1].text.length;
            } else if (
              event.cursor <= newSelection.anchorOffset &&
              event.type === 'createBlock'
            ) {
              newSelection.anchorKey = newBlockKey;
              newSelection.focusKey = newBlockKey;
              newSelection.anchorOffset = 0;
              newSelection.focusOffset = 0;
            } else if (
              event.cursor < newSelection.anchorOffset ||
              (event.cursor === newSelection.anchorOffset &&
                (event.rowDiff <= 0 || event.type === 'insertMultiple'))
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

  const createNewBlock = (blocks, block) => {
    let newBlock = new ContentBlock({
      key: genKey(),
      type: 'unstyled',
      text: '',
      depth: 0,
      characterList: List(),
    });
    blocks.splice(block + 1, 0, newBlock);
    return blocks;
  };

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
      startBlockIndex,
      selectionState
    );
  };

  const handleBlockChanges = () => {};
  const handleSingleBlockEditing = (
    newText,
    sIndex,
    blockIndex,
    selection,
    requiredChange = true
  ) => {
    let targetBlock = content.getBlock(blockIndex);
    const diff = textDiff(targetBlock, newText, sIndex);
    let rowDiff;
    let handled = true;
    let socketEvent = {};
    // Sending Diff to server
    if (diff && diff.type === 'insert') {
      targetBlock.insertKey(diff);
      rowDiff = 1;
      socketEvent = {
        ...diff,
        rowDiff,
        block: targetBlock.uId,
        prev: diff.prev.toString(),
        target: diff.target.toString(),
        next: diff.next.toString(),
      };
    } else if (diff && diff.type === 'insertMultiple') {
      targetBlock.insertMultiple(diff);
      rowDiff = diff.target.length;
      const target = diff.target.map((i) => i.toString());
      socketEvent = {
        ...diff,
        target,
        rowDiff,
        prev: diff.prev.toString(),
        next: diff.next.toString(),
        block: targetBlock.uId,
      };
    } else if (diff && diff.type === 'delete') {
      targetBlock.deleteKey(diff);
      rowDiff = -1;
      socketEvent = {
        ...diff,
        block: targetBlock.uId,
        rowDiff,
        target: diff.target.toString(),
      };
    } else if (diff && diff.type === 'deleteMultiple') {
      const target = diff.target.map((i) => i.toString());
      rowDiff = -diff.target.length;
      targetBlock.deleteMultiple(diff);
      socketEvent = {
        ...diff,
        block: targetBlock.uId,
        target,
        rowDiff,
      };
    } else {
      console.log('No status');
      handled = false;
    }
    setEditorState((editorState) => {
      let newRaws = convertToRaw(editorState.getCurrentContent());
      newRaws.blocks[blockIndex].text = targetBlock.getContent();
      const editor = EditorState.createWithContent(convertFromRaw(newRaws));
      if (handled) {
        socket.emit('editEvent', {
          ...socketEvent,
          stopHandleCursor: !requiredChange,
        });
      }
      return EditorState.forceSelection(
        handled ? editor : editorState,
        selection ||
          (!requiredChange || !handled
            ? editorState.getSelection()
            : editorState
                .getSelection()
                .set(
                  'anchorOffset',
                  editorState.getSelection().getAnchorOffset() + rowDiff
                )
                .set(
                  'focusOffset',
                  editorState.getSelection().getFocusOffset() + rowDiff
                ))
      );
    });
  };

  const handleKeyCommand = (command, editorState) => {};

  const onTab = (e) => {
    const maxDepth = 4;
    onChange(RichUtils.onTab(e, editorState, maxDepth));
  };

  const toggleBlockType = (blockType) => {
    console.log('change');
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    // console.log(inlineStyle);
    // console.log(
    //   convertToRaw(
    //     RichUtils.toggleInlineStyle(
    //       editorState,
    //       inlineStyle
    //     ).getCurrentContent()
    //   )
    // );
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const keyBindingFn = (e) => {
    // TODO: Maybe I can control event by myself here
    // Multi block operation
    let raws = convertToRaw(editorState.getCurrentContent());
    const { startBlockIndex, endBlockIndex, startIndex, endIndex } =
      getSelectionState(editorState);
    if (!inValidKey(e)) {
      if (startBlockIndex < endBlockIndex) {
        for (let i = endBlockIndex; i > startBlockIndex; i--) {
          if (i === endBlockIndex) removeBlock(i, endIndex);
          else removeBlock(i, raws.blocks[i].text.length);
        }
        handleSingleBlockEditing(
          raws.blocks[startBlockIndex].text.slice(0, startIndex),
          startIndex,
          startBlockIndex,
          false
        );
        handleSingleBlockEditing(
          raws.blocks[startBlockIndex].text.slice(0, startIndex) +
            raws.blocks[endBlockIndex].text.slice(endIndex),
          startIndex,
          startBlockIndex,
          false,
          false
        );
        if (e.key === 'Backspace') return 'handled';
      }
    }

    if (e.key === 'Enter') {
      const newText = raws.blocks[startBlockIndex].text.slice(0, startIndex);
      const newText2 = raws.blocks[startBlockIndex].text.slice(startIndex);
      // First handle the previous block
      handleSingleBlockEditing(newText, startIndex, startBlockIndex);
      createBlock(startBlockIndex, startIndex);
      handleSingleBlockEditing(newText2, 0, startBlockIndex + 1, false, false);
      return 'handled';
    } else if (
      e.key === 'Backspace' &&
      startIndex === 0 && // if cursor is at the start of the block
      startBlockIndex !== 0 && // if cursor is not at the start of the first block
      raws.blocks[startBlockIndex].type === 'unstyled' && // This is not remove style
      endIndex === 0
    ) {
      const newText =
        raws.blocks[startBlockIndex - 1].text +
        raws.blocks[startBlockIndex].text.slice(endIndex);
      removeBlock(startBlockIndex, startIndex);
      handleSingleBlockEditing(
        newText,
        raws.blocks[startBlockIndex - 1].text.length,
        startBlockIndex - 1,
        false,
        false
      );
      return 'handled';
    }
    // return 'handled';
    return getDefaultKeyBinding(e);
  };

  const getSelectionState = (editorState) => {
    let startBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === editorState.getSelection().getStartKey());
    let endBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === editorState.getSelection().getEndKey());
    const selectionState = editorState.getSelection();
    let startIndex = selectionState.getStartOffset();
    let endIndex = selectionState.getEndOffset();
    if (startBlockIndex > endBlockIndex) {
      let temp = startBlockIndex;
      startBlockIndex = endBlockIndex;
      endBlockIndex = temp;
      temp = startIndex;
      startIndex = endIndex;
      endIndex = temp;
    }
    return { startBlockIndex, endBlockIndex, startIndex, endIndex };
  };

  const inValidKey = (e) => {
    let keyCodes = [16, 17, 18, 91, 93, 224, 225, 226, 36, 37, 38, 39, 40];
    if (
      keyCodes.includes(e.keyCode) ||
      (e.metaKey && e.keyCode !== 88) ||
      e.ctrlKey
    )
      return true;
    return false;
  };

  const handlePastedText = (text, html) => {
    const { startBlockIndex, endBlockIndex, startIndex, endIndex } =
      getSelectionState(editorState);
    let raws = convertToRaw(editorState.getCurrentContent());
    const blocks = text.split('\n');
    let firstBlockText = raws.blocks[startBlockIndex].text.slice(0, startIndex);
    let lastBlockText = raws.blocks[endBlockIndex].text.slice(startIndex);
    handleSingleBlockEditing(
      firstBlockText,
      firstBlockText.length,
      startBlockIndex,
      false,
      false
    );
    let blockIndex = startBlockIndex;
    for (let i = 0; i < blocks.length; i++) {
      blockIndex = startBlockIndex + i;
      if (i === 0) {
        handleSingleBlockEditing(
          firstBlockText + blocks[i],
          startIndex,
          blockIndex
        );
      } else {
        // Create block
        createBlock(blockIndex - 1, blocks[i].length);
        // Handle the block text
        handleSingleBlockEditing(blocks[i], 0, blockIndex);
      }
    }
    if (blocks.length === 1) {
      handleSingleBlockEditing(
        firstBlockText + blocks[0] + lastBlockText,
        (firstBlockText + blocks[0]).length,
        blockIndex,
        false,
        false
      );
    } else {
      handleSingleBlockEditing(
        blocks[blocks.length - 1] + lastBlockText,
        (blocks[blocks.length - 1] + lastBlockText).length,
        blockIndex,
        false,
        false
      );
    }
    return true;
  };

  const createBlock = (startBlockIndex, startIndex) => {
    let newId = content.createBlock({ startBlockIndex });
    setEditorState((editorState) => {
      let blocks = editorState.getCurrentContent().getBlocksAsArray();
      let newBlocks = createNewBlock(blocks, startBlockIndex);
      let currentId = newBlocks[startBlockIndex + 1].key;
      let newContent = ContentState.createFromBlockArray(newBlocks);
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
      return EditorState.forceSelection(
        // editorState.getCurrentContent(),
        EditorState.createWithContent(newContent),
        // editorState.getSelection()
        editorState
          .getSelection()
          .set('anchorKey', currentId)
          .set('focusKey', currentId)
          .set('anchorOffset', 0)
          .set('focusOffset', 0)
      );
    });
  };

  const removeBlock = (startBlockIndex, startIndex) => {
    setEditorState((editorState) => {
      let blocks = editorState.getCurrentContent().getBlocksAsArray();
      blocks.splice(startBlockIndex, 1);
      let prevBlock = blocks[startBlockIndex - 1];
      let newContent = ContentState.createFromBlockArray(blocks);
      return EditorState.forceSelection(
        EditorState.createWithContent(newContent),
        editorState
          .getSelection()
          .set('anchorKey', prevBlock.key)
          .set('focusKey', prevBlock.key)
          .set('anchorOffset', prevBlock.text.length)
          .set('focusOffset', prevBlock.text.length)
      );
    });
    let targetBlock = content.rowNumToId(startBlockIndex);
    content.removeBlock(targetBlock);

    socket.emit('editEvent', {
      type: 'removeBlock',
      target: targetBlock,
      cursor: startIndex,
      block: targetBlock,
      blockDiff: -1,
    });
  };

  const focus = () => {
    editorRef.current.focus();
  };

  return (
    <div className="RichEditor-root">
      <button
        onClick={() => {
          console.log(convertToRaw(editorState.getCurrentContent()));
          console.log(editorState.getSelection());
          // setEditorState((prevEditorState) => {
          //   let newContent = Modifier.replaceText(
          //     editorState.getCurrentContent(),
          //     prevEditorState.getSelection(),
          //     'this is a test'
          //   );
          //   let newState = EditorState.push(
          //     editorState,
          //     newContent,
          //     'insert-characters'
          //   );
          //   let selection = prevEditorState.getSelection();
          //   let blocks = prevEditorState.getCurrentContent().getBlocksAsArray();
          //   return EditorState.forceSelection(
          //     newState,
          //     // selection
          //     new SelectionState({
          //       anchorKey: selection.getAnchorKey(),
          //       anchorOffset: selection.getAnchorOffset(),
          //       focusKey: selection.getFocusKey(),
          //       focusOffset: selection.getFocusOffset(),
          //       isBackward: selection.isBackward,
          //     })
          //   );
          // });
          // console.log(conver(editorState.getCurrentContent()));
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
          handlePastedText={handlePastedText}
          // placeholder="Tell a story..."
          ref={editorRef}
          spellCheck={true}
        />
      </div>
    </div>
  );
};

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
