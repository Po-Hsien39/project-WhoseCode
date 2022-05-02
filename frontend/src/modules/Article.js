import Block from './Block';
import uniqid from 'uniqid';

class Article {
  constructor() {
    this.blocks = new Block(null);
    this.blocks.next = new Block('firstBlock');
    this.blocks.next.prev = this.blocks;
    this.blocks.next.next = new Block(null);
    this.blocks.next.next.prev = this.blocks.next;
  }
  clearGarbage() {
    // console.log('clearGarbage', new Date());
    // console.log(this.showStructure());
    let current = this.blocks.next;
    while (current.uId !== null) {
      // Throw away deleted blocks
      if (current.inGarbage) {
        current.prev.next = current.next;
        current.next.prev = current.prev;
      } // Only marked those that should be removed
      else if (current.isDeleted) current.inGarbage = true;
      // Check whether there has any text to clean
      else current.clearGarbage();
      current = current.next;
    }
  }
  blockLength() {
    let length = 0;
    let current = this.blocks;
    while (current.next !== null) {
      if (current.uId && !current.isDeleted) length++;
      current = current.next;
    }
    return length;
  }
  getBlock(index) {
    let current = this.blocks;
    while (index > -1) {
      current = current.next;
      // Need to check whether the block is deleted for garbage collection mechanism
      if (!current.isDeleted) index--;
    }
    return current;
  }
  getBlockFromId(id) {
    let current = this.blocks;
    while (current.next !== null) {
      if (current.uId === id) return current;
      current = current.next;
    }
    return null;
  }
  createBlock({
    prev,
    target,
    next,
    startBlockIndex,
    fromOutside,
    style = 'unstyled',
  }) {
    let currentKey = this.blocks;
    let index = 0;
    if (fromOutside) {
      while (true) {
        if (Block.compare(prev, currentKey)) {
          while (true) {
            if (
              !Block.compare(currentKey.next, next) &&
              !Block.correctOrder(target, currentKey)
            ) {
              currentKey = currentKey.next;
              if (!currentKey.isDeleted && currentKey.uId) index++;
            } else {
              let newKey = fromOutside ? new Block(target.uId, style) : target;
              newKey.next = currentKey.next;
              currentKey.next.prev = newKey;
              currentKey.next = newKey;
              newKey.prev = currentKey;
              break;
            }
          }
          break;
        }
        if (!currentKey.isDeleted && currentKey.uId) index++;
        currentKey = currentKey.next;
      }
      return index;
    } else {
      while (startBlockIndex > -1) {
        currentKey = currentKey.next;
        if (!currentKey.isDeleted) startBlockIndex--;
      }
      let uId = uniqid();
      let newKey = new Block(uId, style);
      newKey.next = currentKey.next;
      currentKey.next.prev = newKey;
      currentKey.next = newKey;
      newKey.prev = currentKey;
      return uId;
    }
  }
  removeBlock(uId) {
    let current = this.blocks;
    while (current.next !== null) {
      if (current.next.uId === uId) {
        current.next.isDeleted = true;
        break;
      }
      current = current.next;
    }
  }
  showStructure() {
    let structure = [];
    let current = this.blocks;
    while (current !== null) {
      structure.push({
        id: current.uId,
        isDeleted: current.isDeleted,
        content: current.getContent(),
      });
      current = current.next;
    }
    return structure;
  }
  setInitalContent(blocks) {
    console.log(blocks);
    // Text.clock = 3;
    blocks = blocks.blocks;
    let current = this.blocks;
    for (let i = 0; i < blocks.length; i++) {
      if (i === 0) {
        current.style = blocks[i].style;
        current.next.insertInitialize(blocks[i].text);
      } else {
        let newBlock = new Block(blocks[i].key, blocks[i].style);
        newBlock.next = current.next;
        current.next.prev = newBlock;
        current.next = newBlock;
        newBlock.prev = current;
        newBlock.insertInitialize(blocks[i].text);
      }
      current = current.next;
    }
  }
  static getNextBlock(block) {
    let current = block.next;
    while (current.uId) {
      if (!current.isDeleted) return current;
      current = current.next;
    }
    return current;
  }
  idToRowNum(uId) {
    let rowNum = 0;
    let current = this.blocks.next;
    while (current !== null) {
      if (current.uId === uId) {
        if (!current.isDeleted) return rowNum;
        // TODO: this part should check previous code
        else return -1;
      }
      if (!current.isDeleted) rowNum++;
      current = current.next;
    }
    return rowNum;
  }
  rowNumToId(rowNum) {
    let current = this.blocks;
    let index = -1;
    while (index !== rowNum) {
      if (!current.isDeleted && current.uId) index++;
      if (index !== rowNum) current = current.next;
    }
    return current.uId;
  }
}

export default Article;
