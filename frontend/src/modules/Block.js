import Text from './Text';
import uniqid from 'uniqid';
class Block {
  constructor(uId = uniqid()) {
    this.texts = new Text(null, null, 1);
    this.texts.next = new Text(null, null, 2);
    this.texts.next.prev = this.texts;
    this.style = 'unstyled';
    this.prev = null;
    this.next = null;
    this.isDeleted = false;
    this.uId = uId;
  }
  insertKey({ prev, target, next, fromOutside }) {
    let currentKey = this.texts;
    while (currentKey.next !== null) {
      if (Text.compare(prev, currentKey)) {
        while (true) {
          if (
            !Text.compare(currentKey.next, next) &&
            !Text.correctOrder(target, currentKey)
          ) {
            currentKey = currentKey.next;
          } else {
            let newKey = fromOutside
              ? new Text(target.user, target.content, target.clock)
              : target;
            newKey.next = currentKey.next;
            currentKey.next.prev = newKey;
            currentKey.next = newKey;
            newKey.prev = currentKey;
            break;
          }
        }
        break;
      }
      currentKey = currentKey.next;
    }
  }

  insertMultiple({ prev, next, target, fromOutside }) {
    if (fromOutside) Text.updateClock(target.slice(-1)[0]);
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

  deleteKey({ target }) {
    let currentKey = this.texts;
    while (currentKey.next !== null) {
      if (Text.compare(target, currentKey)) {
        currentKey.deleted = true;
        break;
      }
      currentKey = currentKey.next;
    }
  }

  deleteMultiple({ target }) {
    let currentKey = this.texts;
    while (target.length) {
      let targetKey = target.shift();
      while (true) {
        if (Text.compare(targetKey, currentKey)) {
          currentKey.deleted = true;
          currentKey = currentKey.next;
          break;
        }
        currentKey = currentKey.next;
      }
    }
  }

  showStructure() {
    let structure = [];
    let current = this.texts;
    while (current !== null) {
      structure.push({
        clock: current.clock,
        content: current.content,
        deleted: current.deleted,
      });
      current = current.next;
    }
    return structure;
  }

  getContent() {
    let content = '';
    let current = this.texts.next;
    while (current.next !== null) {
      if (!current.deleted) content += current.content;
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
      if (!target.deleted) {
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
      if (!parentNode.deleted) index++;
    }
    if (status === 'insert') {
      return { prev: parentNode, next: parentNode.next };
    } else if (status === 'delete') {
      parentNode = parentNode.next;
      while (parentNode.deleted) {
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
