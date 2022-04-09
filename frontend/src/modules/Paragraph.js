import Text from './Text';

class Paragraph {
  constructor() {
    this.texts = new Text(null, null);
    this.texts.next = new Text(null, null);
    this.texts.next.prev = this.texts;
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

  getContent() {
    let content = '';
    let current = this.texts.next;
    while (current.next !== null) {
      if (!current.deleted) content += current.content;
      current = current.next;
    }
    return content;
  }

  static getChainFamily(parentNode, id, status) {
    let index = 0;
    while (index !== id - 1) {
      if (!parentNode.deleted) index++;
      parentNode = parentNode.next;
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
    } else {
      console.log('No status');
    }
  }
}

export default Paragraph;
