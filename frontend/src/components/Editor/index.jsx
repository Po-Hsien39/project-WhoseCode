/* eslint-disable */
import {
  useState,
  useEffect,
  useRef,
  Component,
  useCallback,
  Fragment,
} from 'react';
import { textDiff } from '../../utils';
import Block from '../../modules/Block';
import Article from '../../modules/Article';
import { useStatus } from '../../hook/useStatus';
import { List } from 'immutable';
import { PrismDraftDecorator } from '../../modules/code-highlight';
import Prism from 'prismjs';
import { BLOCK_TYPES, styleMap, INLINE_STYLES } from '../../constants/constant';
import { myBlockRenderer, extendedBlockRenderMap } from './configs/blockRender';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import 'prismjs/themes/prism-coy.css';
import '../../css/Editor.css';
import _ from 'lodash';
import eventHandle from './event';
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
} from 'draft-js';
const decorations = new PrismDraftDecorator(Prism.languages.javascript);
const DraftJSRichTextEditor = ({ url }) => {
  const {
    editorState,
    setEditorState,
    setNote,
    note,
    setOtherNotesPermission,
  } = useStatus();
  // const [editorState, setEditorState] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [content, setContent] = useState(null);
  const { socket, request } = useStatus();
  const editorRef = useRef(null);
  useEffect(() => {
    console.log(readOnly);
  }, [readOnly]);
  useEffect(() => {
    if (url) {
      setContent(new Article());
    }
  }, [url]);

  useEffect(() => {
    if (content && setEditorState && setOtherNotesPermission) {
      setOtherNotesPermission((prev) => ({ ...prev, status: false }));
      const setPreview = async () => {
        let res;
        try {
          res = await request.getNote(url);
          setReadOnly(false);
          console.log('???????');
          if (res.data.permission) {
            const { allowComment, allowEdit, allowDuplicate } =
              res.data.permission;
            setOtherNotesPermission((prev) => ({
              ...prev,
              status: true,
              permission: { allowComment, allowEdit, allowDuplicate },
            }));
            if (!allowEdit) {
              console.log('read only');
              setReadOnly(true);
            }
          }
          setNote((prev) => {
            return {
              ...prev,
              id: res.data.noteId,
              title: res.data.title,
              star: res.data.star,
            };
          });
          if (!res.data.latest) {
            setEditorState(EditorState.createEmpty(decorations));
            return;
          } else {
            const rawContent = JSON.parse(res.data.latest);
            if (rawContent) {
              setEditorState(
                EditorState.createWithContent(
                  convertFromRaw(rawContent),
                  decorations
                )
              );
              content.setInitalContent(rawContent);
            } else {
              setEditorState(EditorState.createEmpty(decorations));
            }
          }
        } catch (error) {
          console.log(error.response.status);
          if (error.response.status === 401) {
            setOtherNotesPermission((prev) => ({
              ...prev,
              status: true,
              blocked: true,
              blockedType: 'denied',
            }));
          } else if (error.response.status === 404) {
            setOtherNotesPermission((prev) => ({
              ...prev,
              status: true,
              blocked: true,
              blockedType: 'notfound',
            }));
          }
        }
      };
      setPreview();
    }
  }, [content, setEditorState, setOtherNotesPermission]);

  useEffect(() => {
    if (socket && editorState && note.id) {
      debounceLoadData(socket, editorState.getCurrentContent(), note.id);
    }
  }, [socket, editorState, note]);

  useEffect(() => {
    if (socket && content && note.id) {
      socket.emit('changeRoom', note.id);
      function handleEvent(event) {
        setEditorState((editorState) => {
          return eventHandle(editorState, event, content);
        });
      }
      socket.on('newEvent', handleEvent);
      return () => {
        socket.off('newEvent', handleEvent);
      };
    }
  }, [socket, content, note.id]);

  // Auto Saving
  const saveContent = (socket, content, noteId) => {
    socket.emit('saveNotes', {
      content: JSON.stringify(convertToRaw(content)),
      noteId: noteId,
    });
  };
  const debounceLoadData = useCallback(_.debounce(saveContent, 3000), []);

  const createNewBlock = (blocks, block, type = 'unstyled') => {
    let newBlock = new ContentBlock({
      key: genKey(),
      type,
      text: '',
      depth: 0,
      characterList: List(),
    });
    blocks.splice(block + 1, 0, newBlock);
    return blocks;
  };

  const onChange = (editorState) => {
    console.log(editorState);
    console.log(editorState.getSelection());
    if (!editorState.getSelection().getHasFocus()) {
      setEditorState(editorState);
      return;
    }
    const startBlockKey = editorState.getSelection().getStartKey();
    const endBlockKey = editorState.getSelection().getEndKey();
    const startBlockIndex = editorState
      .getCurrentContent()
      .getBlockMap()
      .keySeq()
      .findIndex((k) => k === startBlockKey);
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
      setEditorState(editorState);
      socket.emit('editEvent', {
        id: note.id,
        style: content.getBlock(startBlockIndex).style,
        type: 'changeStyle',
        block: content.getBlock(startBlockIndex).uId,
        cursor: null,
      });
    } else {
      handleSingleBlockEditing(
        newRaws.blocks[startBlockIndex].text,
        startIndex,
        startBlockIndex,
        selectionState,
        true
      );
    }
  };

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
      const editor = EditorState.createWithContent(
        convertFromRaw(newRaws),
        decorations
      );
      // Selection means only default operation needs to be send
      if (handled && selection) {
        socket.emit('editEvent', {
          id: note.id,
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
    return socketEvent;
  };

  const handleKeyCommand = (command, editorState) => {
    console.log(command);
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
    // Multi block operation
    let raws = convertToRaw(editorState.getCurrentContent());
    const { startBlockIndex, endBlockIndex, startIndex, endIndex } =
      getSelectionState(editorState);

    if (!inValidKey(e)) {
      if (startBlockIndex < endBlockIndex) {
        let removeBlocks = [];
        // from end to start
        for (let i = endBlockIndex; i > startBlockIndex; i--) {
          if (i === endBlockIndex) removeBlocks.push(removeBlock(i, endIndex));
          else removeBlocks.push(removeBlock(i, raws.blocks[i].text.length));
        }
        let removeKeys = handleSingleBlockEditing(
          raws.blocks[startBlockIndex].text.slice(0, startIndex),
          startIndex,
          startBlockIndex,
          false
        );
        let insertKeys = handleSingleBlockEditing(
          raws.blocks[startBlockIndex].text.slice(0, startIndex) +
            raws.blocks[endBlockIndex].text.slice(endIndex),
          startIndex,
          startBlockIndex,
          false,
          false
        );
        socket.emit('editEvent', {
          id: note.id,
          type: 'removeBlocks',
          target: removeBlocks,
          block: content.rowNumToId(startBlockIndex),
          blockDiff: -removeBlocks.length,
          cursor: startIndex,
          deleteKeys: removeKeys.target,
          deleteType: removeKeys.type,
          insertType: insertKeys.type,
          insertNext: insertKeys.next,
          insertPrev: insertKeys.prev,
          insertTarget: insertKeys.target,
        });
        if (e.key === 'Backspace') return 'handled';
      }
    }
    const style = raws.blocks[startBlockIndex].type;

    if (e.key === 'Enter') {
      const newText = raws.blocks[startBlockIndex].text.slice(0, startIndex);
      const newText2 = raws.blocks[startBlockIndex].text.slice(startIndex);
      // First handle the previous block
      let deleteKeys = handleSingleBlockEditing(
        newText,
        startIndex,
        startBlockIndex
      );
      let newId = createBlock(startBlockIndex, style);
      let insertKeys = handleSingleBlockEditing(
        newText2,
        0,
        startBlockIndex + 1,
        false,
        false
      );
      socket.emit('editEvent', {
        id: note.id,
        type: 'createBlock',
        target: { uId: newId },
        block: content.rowNumToId(startBlockIndex),
        blockDiff: 1,
        cursor: startIndex,
        prev: content.getBlock(startBlockIndex).toString(),
        insertType: insertKeys.type,
        insertKeys: insertKeys.target,
        insertPrev: insertKeys.prev,
        insertNext: insertKeys.next,
        deleteType: deleteKeys.type,
        deleteKeys: deleteKeys.target,
        blockStyle: style,
        next: Article.getNextBlock(
          content.getBlock(startBlockIndex + 1)
        ).toString(),
      });
      return 'handled';
    } else if (
      e.key === 'Backspace' &&
      startBlockIndex !== 0 && // if cursor is not at the start of the first block
      startIndex === 0 && // if cursor is at the start of the block
      // raws.blocks[startBlockIndex].type === 'unstyled' && // This is not remove style
      endIndex === 0
    ) {
      // if (backspaceRemoveType(style)) {
      //   changeStyle(startBlockIndex, 'unstyled');
      // } else {
      const newText =
        raws.blocks[startBlockIndex - 1].text +
        raws.blocks[startBlockIndex].text.slice(endIndex);
      const targetBlock = removeBlock(startBlockIndex, startIndex);
      let insertKeys = handleSingleBlockEditing(
        newText,
        raws.blocks[startBlockIndex - 1].text.length,
        startBlockIndex - 1,
        false,
        false
      );
      socket.emit('editEvent', {
        id: note.id,
        type: 'removeBlock',
        insertType: insertKeys.type,
        insertBlock: insertKeys.block,
        insertTarget: insertKeys.target,
        insertPrev: insertKeys.prev,
        insertNext: insertKeys.next,
        target: content.rowNumToId(startBlockIndex - 1),
        cursor: startIndex,
        block: targetBlock,
        blockDiff: -1,
      });
      // }
      return 'handled';
    }
    return getDefaultKeyBinding(e);
  };
  const changeStyle = (blockIndex, style) => {
    let targetBlock = content.getBlock(blockIndex);
    targetBlock.style = style;
    setEditorState((editorState) => {
      let newContent = convertToRaw(editorState.getCurrentContent());
      newContent.blocks[blockIndex].type = style;
      return EditorState.createWithContent(convertFromRaw(newContent));
    });
  };
  // const changeStyle = (blockIndex, style) => {
  //   console.log('change');
  //   let targetBlock = content.getBlock(blockIndex);
  //   targetBlock.style = style;
  //   setEditorState((editorState) => {
  //     return EditorState.push(
  //       editorState,
  //       ContentState.createFromText(targetBlock.text),
  //       'change-block-type'
  //     );
  //   });
  // };
  // let newContent = convertToRaw(
  //   editorState.getCurrentContent().getBlocksAsArray()
  // );
  // newContent[blockIndex].type = style;
  // console.log(newContent);

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
    let createdBlocks = [];
    let insertKeys;
    let deleteKeys = handleSingleBlockEditing(
      firstBlockText,
      firstBlockText.length,
      startBlockIndex,
      false,
      false
    );
    let blockIndex = startBlockIndex;
    for (let i = 0; i < blocks.length; i++) {
      blockIndex = startBlockIndex + i;
      let insertText;
      let blockId;
      if (i === 0) {
        blockId = content.rowNumToId(startBlockIndex);
        insertText = handleSingleBlockEditing(
          firstBlockText + blocks[i],
          startIndex,
          blockIndex
        );
      } else {
        // Create block
        blockId = createBlock(blockIndex - 1);
        // Handle the block text
        insertText = handleSingleBlockEditing(blocks[i], 0, blockIndex);
      }
      createdBlocks.push({
        blockId,
        type: insertText.type,
        insertPrev: insertText.prev,
        insertNext: insertText.next,
        insertTarget: insertText.target,
      });
    }
    if (blocks.length === 1) {
      insertKeys = handleSingleBlockEditing(
        firstBlockText + blocks[0] + lastBlockText,
        (firstBlockText + blocks[0]).length,
        blockIndex,
        false,
        false
      );
    } else {
      insertKeys = handleSingleBlockEditing(
        blocks[blocks.length - 1] + lastBlockText,
        (blocks[blocks.length - 1] + lastBlockText).length,
        blockIndex,
        false,
        false
      );
    }
    socket.emit('editEvent', {
      id: note.id,
      type: 'createBlocks',
      blocksContent: createdBlocks,
      cursor: startIndex,
      block: content.rowNumToId(startBlockIndex),
      next: Article.getNextBlock(
        content.getBlock(startBlockIndex + blocks.length - 1)
      ).toString(),
      insertType: insertKeys.type,
      insertKeys: insertKeys.target,
      insertPrev: insertKeys.prev,
      insertNext: insertKeys.next,
      deleteType: deleteKeys.type,
      deleteKeys: deleteKeys.target,
    });
    return true;
  };

  const createBlock = (startBlockIndex, style = 'unstyled') => {
    let newId = content.createBlock({ startBlockIndex, style });
    setEditorState((editorState) => {
      let blocks = editorState.getCurrentContent().getBlocksAsArray();
      let newBlocks = createNewBlock(blocks, startBlockIndex, style);
      let currentId = newBlocks[startBlockIndex + 1].key;
      let newContent = ContentState.createFromBlockArray(newBlocks);
      return EditorState.forceSelection(
        EditorState.createWithContent(newContent, decorations),
        editorState
          .getSelection()
          .set('anchorKey', currentId)
          .set('focusKey', currentId)
          .set('anchorOffset', 0)
          .set('focusOffset', 0)
      );
    });
    return newId;
  };

  const removeBlock = (startBlockIndex, startIndex) => {
    let targetBlock = content.rowNumToId(startBlockIndex);
    content.removeBlock(targetBlock);
    setEditorState((editorState) => {
      let blocks = editorState.getCurrentContent().getBlocksAsArray();
      blocks.splice(startBlockIndex, 1);
      let prevBlock = blocks[startBlockIndex - 1];
      let newContent = ContentState.createFromBlockArray(blocks);
      return EditorState.forceSelection(
        EditorState.createWithContent(newContent, decorations),
        editorState
          .getSelection()
          .set('anchorKey', prevBlock.key)
          .set('focusKey', prevBlock.key)
          .set('anchorOffset', prevBlock.text.length)
          .set('focusOffset', prevBlock.text.length)
      );
    });
    return targetBlock;
  };

  const focus = () => {
    // editorRef.current.focus();
  };

  return (
    <Fragment>
      {editorState ? (
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
              readOnly={readOnly}
              // blockStyleFn={getBlockStyle}
              // customStyleMap={styleMap}
              editorState={editorState}
              // handleKeyCommand={handleKeyCommand}
              onChange={onChange}
              // onTab={onTab}
              // keyBindingFn={keyBindingFn}
              // handlePastedText={handlePastedText}
              // blockRenderMap={extendedBlockRenderMap}
              // blockRendererFn={myBlockRenderer}
              // placeholder="Tell a story..."
              ref={editorRef}
              // spellCheck={true}
            />
          </div>
        </div>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '35vh',
            width: '100%',
            alignItems: 'center',
          }}>
          <CircularProgress color="secondary" />
          <Typography
            variant="h7"
            sx={{ color: 'gray', marginTop: '25px' }}
            noWrap>
            Please Wait~ Your Note is on the way
          </Typography>
        </Box>
      )}
    </Fragment>
  );
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
