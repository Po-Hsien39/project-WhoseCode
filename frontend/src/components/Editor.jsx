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
          let blocks = editorState.getCurrentContent().getBlocksAsArray();
          const selection = editorState.getSelection();
          let newBlockKey, finalText;
          let newSelection = {
            anchorKey: selection.getAnchorKey(),
            anchorOffset: selection.getAnchorOffset(),
            focusKey: selection.getFocusKey(),
            focusOffset: selection.getFocusOffset(),
            isBackward: selection.isBackward,
          };
          const currentBlockIndex = editorState
            .getCurrentContent()
            .getBlockMap()
            .keySeq()
            .findIndex((k) => k === newSelection.anchorKey);
          let newRaws = convertToRaw(editorState.getCurrentContent());
          let newContent = null,
            deleteNum = 0,
            currentId = content.rowNumToId(currentBlockIndex);
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
            // First delete modify previous block
            if (event.deleteType === 'delete')
              targetBlock.deleteKey({ target: event.deleteKeys });
            else if (event.deleteType === 'deleteMultiple')
              targetBlock.deleteMultiple({ target: event.deleteKeys });
            // Then insert new block
            const newBlockIndex = content.createBlock({
              ...event,
              fromOutside: true,
            });
            const newBlock = content.getBlockFromId(event.target.uId);
            let insertContent = {
              prev: event.insertPrev,
              next: event.insertNext,
              target: event.insertKeys,
              fromOutside: true,
            };
            if (event.insertType === 'insert')
              newBlock.insertKey(insertContent);
            else if (event.insertType === 'insertMultiple')
              newBlock.insertMultiple(insertContent);
            // newRaws.blocks[blockNum].text = targetBlock.getContent();
            let newBlocks = createNewBlock(blocks, newBlockIndex);
            newBlockKey = newBlocks[blockNum + 1].key;
            newContent = ContentState.createFromBlockArray(newBlocks);
            let insertedRaw = convertToRaw(newContent);
            insertedRaw.blocks[blockNum].text = targetBlock.getContent();
            insertedRaw.blocks[blockNum + 1].text = newBlock.getContent();
            newContent = convertFromRaw(insertedRaw);
          } else if (event && event.type === 'createBlocks') {
            // First delete modify previous block
            if (event.deleteType === 'delete')
              targetBlock.deleteKey({ target: event.deleteKeys });
            else if (event.deleteType === 'deleteMultiple') {
              targetBlock.deleteMultiple({ target: event.deleteKeys });
            }
            const blockDetails = event.blocksContent;
            for (let i = 0; i < blockDetails.length; i++) {
              if (i !== 0) {
                content.createBlock({
                  prev: { uId: blockDetails[i - 1].blockId },
                  target: { uId: blockDetails[i].blockId },
                  next: { uId: blockDetails[i].blockId },
                  fromOutside: true,
                });
                blocks = createNewBlock(blocks, blockNum + i - 1);
                newContent = ContentState.createFromBlockArray(blocks);
                newRaws = convertToRaw(newContent);
              }
              let target = content.getBlockFromId(blockDetails[i].blockId);
              let insertContent = {
                prev: blockDetails[i].insertPrev,
                next: blockDetails[i].insertNext,
                target: blockDetails[i].insertTarget,
                fromOutside: true,
              };
              if (blockDetails[i].type === 'insert') {
                target.insertKey(insertContent);
              } else if (blockDetails[i].type === 'insertMultiple') {
                target.insertMultiple(insertContent);
              }
              if (i === blockDetails.length - 1) {
                newBlockKey = blocks[blockNum + i].key;
                finalText = blockDetails[i].insertTarget.length;
                insertContent = {
                  prev: event.insertPrev,
                  next: event.insertNext,
                  target: event.insertKeys,
                  fromOutside: true,
                };
                if (event.insertType === 'insert')
                  target.insertKey(insertContent);
                else if (event.insertType === 'insertMultiple')
                  target.insertMultiple(insertContent);
              }
              newRaws.blocks[blockNum + i].text = target.getContent();
              blocks = convertFromRaw(newRaws).getBlocksAsArray();
            }
            if (blockDetails.length === 1) finalText += event.cursor;
            newContent = convertFromRaw(newRaws);
          } else if (event && event.type === 'removeBlock') {
            // First delete modify previous block
            const target = event.target;
            const blockIndex = content.idToRowNum(target);
            content.removeBlock(target);
            blocks.splice(blockIndex, 1);
            // Then Modified previous block
            const targetBlock = content.getBlockFromId(event.insertBlock);
            let insertContent = {
              prev: event.insertPrev,
              next: event.insertNext,
              target: event.insertTarget,
              fromOutside: true,
            };
            if (event.insertType === 'insert')
              targetBlock.insertKey(insertContent);
            else if (event.insertType === 'insertMultiple')
              targetBlock.insertMultiple(insertContent);

            newContent = ContentState.createFromBlockArray(blocks);
            let modifiedRaws = convertToRaw(newContent);
            // TODO: Bugs: what if the block is deleted?
            modifiedRaws.blocks[blockNum - 1].text = targetBlock.getContent();
            newContent = convertFromRaw(modifiedRaws);
          } else if (event && event.type === 'removeBlocks') {
            // First remove blocks
            for (let i = 0; i < event.target.length; i++) {
              const blockIndex = content.idToRowNum(event.target[i]);
              content.removeBlock(event.target[i]);
              if (blockIndex !== -1) blocks.splice(blockIndex, 1);
            }
            if (event.deleteType === 'delete')
              targetBlock.deleteKey({ target: event.deleteKeys });
            else if (event.deleteType === 'deleteMultiple')
              targetBlock.deleteMultiple({ target: event.deleteKeys });
            let insertContent = {
              prev: event.insertPrev,
              next: event.insertNext,
              target: event.insertTarget,
              fromOutside: true,
            };
            if (event.insertType === 'insert')
              targetBlock.insertKey(insertContent);
            else if (event.insertType === 'insertMultiple')
              targetBlock.insertMultiple(insertContent);

            newContent = ContentState.createFromBlockArray(blocks);
            let modifiedRaws = convertToRaw(newContent);
            // If the row exists, modify it
            if (blockNum !== -1) {
              modifiedRaws.blocks[blockNum].text = targetBlock.getContent();
              newContent = convertFromRaw(modifiedRaws);
            }
            // return editorState;
          } else {
            console.log('unknown event');
            return editorState;
          }
          // TODO: need to handle when the user select from back to front
          if (event.type === 'removeBlocks') {
            if (
              event.target.includes(currentId) ||
              (currentId === event.block &&
                newSelection.anchorOffset >= event.cursor)
            ) {
              newSelection.anchorKey = newRaws.blocks[blockNum].key;
              newSelection.focusKey = newRaws.blocks[blockNum].key;
              newSelection.anchorOffset = newRaws.blocks[blockNum].text.length;
              newSelection.focusOffset = newRaws.blocks[blockNum].text.length;
            }
          } else if (
            blockNum === currentBlockIndex &&
            !event.stopHandleCursor &&
            event.type !== 'changeStyle'
          ) {
            if (event.type === 'removeBlock') {
              newSelection.anchorKey = newRaws.blocks[blockNum - 1].key;
              newSelection.focusKey = newRaws.blocks[blockNum - 1].key;
              newSelection.anchorOffset +=
                newRaws.blocks[blockNum - 1].text.length;
              newSelection.focusOffset +=
                newRaws.blocks[blockNum - 1].text.length;
            } else if (
              event.type === 'createBlocks' &&
              event.cursor <= newSelection.anchorOffset
            ) {
              newSelection.anchorKey = newBlockKey;
              newSelection.focusKey = newBlockKey;
              newSelection.anchorOffset =
                newSelection.anchorOffset - event.cursor + finalText;
              newSelection.focusOffset =
                newSelection.anchorOffset - event.cursor + finalText;
            } else if (
              event.cursor <= newSelection.anchorOffset &&
              event.type === 'createBlock'
            ) {
              newSelection.anchorKey = newBlockKey;
              newSelection.focusKey = newBlockKey;
              newSelection.anchorOffset -= event.cursor;
              newSelection.focusOffset -= event.cursor;
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
            } else {
              console.log('unknown cursor');
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
      setEditorState(editorState);
      socket.emit('editEvent', {
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
        selectionState
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
      const editor = EditorState.createWithContent(convertFromRaw(newRaws));
      // Selection means only default operation needs to be send
      if (handled && selection) {
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

    if (e.key === 'Enter') {
      const newText = raws.blocks[startBlockIndex].text.slice(0, startIndex);
      const newText2 = raws.blocks[startBlockIndex].text.slice(startIndex);
      // First handle the previous block
      let deleteKeys = handleSingleBlockEditing(
        newText,
        startIndex,
        startBlockIndex
      );
      let newId = createBlock(startBlockIndex, startIndex);
      let insertKeys = handleSingleBlockEditing(
        newText2,
        0,
        startBlockIndex + 1,
        false,
        false
      );
      socket.emit('editEvent', {
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
        next: Article.getNextBlock(
          content.getBlock(startBlockIndex + 1)
        ).toString(),
      });
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
      const targetBlock = removeBlock(startBlockIndex, startIndex);
      let insertKeys = handleSingleBlockEditing(
        newText,
        raws.blocks[startBlockIndex - 1].text.length,
        startBlockIndex - 1,
        false,
        false
      );
      socket.emit('editEvent', {
        type: 'removeBlock',
        insertType: insertKeys.type,
        insertBlock: insertKeys.block,
        insertTarget: insertKeys.target,
        insertPrev: insertKeys.prev,
        insertNext: insertKeys.next,
        target: targetBlock,
        cursor: startIndex,
        block: targetBlock,
        blockDiff: -1,
      });
      return 'handled';
    }
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
        blockId = createBlock(blockIndex - 1, blocks[i].length);
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

  const createBlock = (startBlockIndex, startIndex) => {
    let newId = content.createBlock({ startBlockIndex });
    setEditorState((editorState) => {
      let blocks = editorState.getCurrentContent().getBlocksAsArray();
      let newBlocks = createNewBlock(blocks, startBlockIndex);
      let currentId = newBlocks[startBlockIndex + 1].key;
      let newContent = ContentState.createFromBlockArray(newBlocks);
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
        EditorState.createWithContent(newContent),
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
    editorRef.current.focus();
  };

  return (
    <div className="RichEditor-root">
      <button
        onClick={() => {
          console.log(editorState.getSelection());
          // console.log(convertToRaw(editorState.getCurrentContent()));
          // console.log(editorState.getSelection());
          // setEditorState((prevEditorState) => {
          //   let newContent = Modifier.replaceText(
          //     editorState.getCurrentContent(),
          //     editorState
          //       .getSelection()
          //       .set('anchorOffset', 0)
          //       .set('focusOffset', 10),
          //     'this is a test'
          //   );
          //   console.log(newContent);
          //   // let newState = ContentState.createFromBlockArray(newContent);
          //   let newState = EditorState.push(
          //     editorState,
          //     newContent,
          //     'insert-characters'
          //   );
          //   // console.log(newState);
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
