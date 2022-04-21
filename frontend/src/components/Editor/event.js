import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
  SelectionState,
  ContentBlock,
  genKey,
} from 'draft-js';
import { List } from 'immutable';
import { PrismDraftDecorator } from '../../modules/code-highlight';
import Prism from 'prismjs';
import Text from '../../modules/Text';

const decorations = new PrismDraftDecorator(Prism.languages.javascript);
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

const EventHandle = (editorState, event, content) => {
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
      style: event.blockStyle,
    });
    const newBlock = content.getBlockFromId(event.target.uId);
    let insertContent = {
      prev: event.insertPrev,
      next: event.insertNext,
      target: event.insertKeys,
      fromOutside: true,
    };
    if (event.insertType === 'insert') newBlock.insertKey(insertContent);
    else if (event.insertType === 'insertMultiple')
      newBlock.insertMultiple(insertContent);
    // newRaws.blocks[blockNum].text = targetBlock.getContent();
    let newBlocks = createNewBlock(blocks, newBlockIndex, event.blockStyle);
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
        finalText = blockDetails[i].insertTarget
          ? blockDetails[i].insertTarget.length
          : 0;
        insertContent = {
          prev: event.insertPrev,
          next: event.insertNext,
          target: event.insertKeys,
          fromOutside: true,
        };
        if (event.insertType === 'insert') target.insertKey(insertContent);
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
    content.removeBlock(blockId);
    blocks.splice(blockNum, 1);
    // Then Modified previous block
    const targetBlock = content.getBlockFromId(event.target);
    let insertContent = {
      prev: event.insertPrev,
      next: event.insertNext,
      target: event.insertTarget,
      fromOutside: true,
    };
    if (event.insertType === 'insert') targetBlock.insertKey(insertContent);
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
    if (event.insertType === 'insert') targetBlock.insertKey(insertContent);
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
      (currentId === event.block && newSelection.anchorOffset >= event.cursor)
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
      newSelection.anchorOffset += newRaws.blocks[blockNum - 1].text.length;
      newSelection.focusOffset += newRaws.blocks[blockNum - 1].text.length;
    } else if (
      event.type === 'createBlocks' &&
      event.cursor < newSelection.anchorOffset
    ) {
      newSelection.anchorKey = newBlockKey;
      newSelection.focusKey = newBlockKey;
      newSelection.anchorOffset =
        newSelection.anchorOffset - event.cursor + finalText;
      newSelection.focusOffset =
        newSelection.anchorOffset - event.cursor + finalText;
    } else if (
      event.cursor < newSelection.anchorOffset &&
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
    EditorState.createWithContent(newContent, decorations),
    new SelectionState(newSelection)
  );
};

export default EventHandle;
