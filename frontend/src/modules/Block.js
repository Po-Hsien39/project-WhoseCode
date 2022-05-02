import Text from './Text';
import uniqid from 'uniqid';
class Block {
  constructor(uId = uniqid(), style) {
    this.texts = new Text(null, null, 1);
    this.texts.next = new Text(null, null, 2);
    this.texts.next.prev = this.texts;
    this.style = style;
    this.prev = null;
    this.next = null;
    this.isDeleted = false;
    this.uId = uId;
    this.inGarbage = false;
  }
  insertKey({ prev, target, next, fromOutside }) {
    // console.log(prev, target, next, fromOutside);
    console.log(target);
    let currentKey = this.texts;
    while (currentKey.next !== null) {
      if (Text.compare(prev, currentKey)) {
        currentKey = currentKey.next;
        while (true) {
          if (
            currentKey.next && // At the end of the list
            !Text.compare(currentKey, next) &&
            !Text.correctOrder(target, currentKey)
          ) {
            currentKey = currentKey.next;
          } else {
            let newKey = fromOutside
              ? new Text(target.user, target.content, target.clock)
              : target;
            newKey.next = currentKey;
            newKey.prev = currentKey.prev;
            newKey.prev.next = newKey;
            newKey.next.prev = newKey;
            break;
          }
        }
        break;
      }
      currentKey = currentKey.next;
    }
    console.log(this.showStructure());
  }

  insertMultiple({ prev, next, target, fromOutside }) {
    if (fromOutside) Text.updateClock(target.slice(-1)[0].clock);
    let currentKey = this.texts;
    while (true) {
      if (Text.compare(prev, currentKey)) {
        while (true) {
          if (
            !Text.compare(currentKey.next, next) &&
            !Text.correctOrder(target, currentKey)
          ) {
            currentKey = currentKey.next;
          } else {
            for (let i = 0; i < target.length; i++) {
              let newKey = fromOutside
                ? new Text(target[i].user, target[i].content, target[i].clock)
                : target[i];
              newKey.next = currentKey.next;
              currentKey.next.prev = newKey;
              currentKey.next = newKey;
              newKey.prev = currentKey;
              currentKey = currentKey.next;
            }
            break;
          }
        }
        break;
      } else {
        currentKey = currentKey.next;
      }
    }
  }

  insertInitialize(texts) {
    let current = this.texts;
    Text.clock = 3;
    for (let i = 0; i < texts.length; i++) {
      let newKey = new Text('dev', texts[i]);
      newKey.next = current.next;
      current.next.prev = newKey;
      current.next = newKey;
      newKey.prev = current;
      current = current.next;
    }
  }

  deleteKey({ target }) {
    let currentKey = this.texts;
    console.log(target);
    console.log(this.showStructure());
    while (currentKey.next !== null) {
      if (Text.compare(target, currentKey)) {
        currentKey.isDeleted = true;
        break;
      }
      currentKey = currentKey.next;
    }
  }

  deleteMultiple({ target, currentCursor = 0 }) {
    let currentKey = this.texts;
    let textLen = 0;
    let removeCnt = 0;
    while (target.length) {
      let targetKey = target.shift();
      while (true) {
        if (currentKey.content && !currentKey.isDeleted) textLen += 1;
        if (Text.compare(targetKey, currentKey)) {
          if (textLen <= currentCursor) removeCnt++;
          currentKey.isDeleted = true;
          currentKey = currentKey.next;
          break;
        }
        currentKey = currentKey.next;
      }
    }
    return removeCnt;
  }

  clearGarbage() {
    let current = this.texts.next;
    while (current.next !== null) {
      if (current.inGarbage) {
        current.prev.next = current.next;
        current.next.prev = current.prev;
      } else if (current.isDeleted) current.inGarbage = true;
      current = current.next;
    }
  }

  showStructure() {
    let structure = [];
    let current = this.texts;
    while (current !== null) {
      structure.push({
        clock: current.clock,
        content: current.content,
        isDeleted: current.isDeleted,
        user: current.user,
      });
      current = current.next;
    }
    return structure;
  }

  getContent() {
    let content = '';
    let current = this.texts.next;
    while (current.next !== null) {
      if (!current.isDeleted) content += current.content;
      current = current.next;
    }
    return content;
  }
  toString() {
    if (this) return { uId: this.uId };
  }

  getDeleteMap(target, length) {
    let deleteMap = [];
    while (length > 0) {
      if (!target.isDeleted) {
        deleteMap.push(target);
        length--;
      }
      target = target.next;
    }
    return deleteMap;
  }

  static compare(blockA, blockB) {
    if (blockA.uId === blockB.uId) return true;
    return false;
  }

  static correctOrder(blockA, blockB) {
    if (blockA.uId > blockB.uId) return true;
    return false;
  }

  static compareStyle(styleA, styleB) {
    if (styleA === styleB) return true;
    return false;
  }

  static getChainFamily(parentNode, id, status) {
    let index = 0;
    while (index !== id) {
      parentNode = parentNode.next;
      if (!parentNode.isDeleted) index++;
    }
    if (status === 'insert') {
      // Update Part: In order to use garbage collection, it is necessary to check if the text is deleted.
      let prev = parentNode;
      parentNode = parentNode.next;
      while (true) {
        if (parentNode.isDeleted) {
          parentNode = parentNode.next;
        } else break;
      }
      return { prev, next: parentNode };
    } else if (status === 'delete') {
      parentNode = parentNode.next;
      while (parentNode.isDeleted) {
        parentNode = parentNode.next;
      }
      // return { prev: parentNode, next: parentNode.next.next };
      return { target: parentNode };
    } else if (status === 'index') {
      return { target: parentNode };
    } else {
      console.log('No status');
    }
  }
}

export default Block;
