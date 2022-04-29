import Block from '../modules/Block';
import Text from '../modules/Text';

const textDiff = (oldText, newText, cursorPosition) => {
  let oldTextLength = oldText.getContent().length;
  let maxSize = Math.max(oldTextLength, newText.length);
  let minSize = Math.min(oldTextLength, newText.length);
  // Single character diff (Delete or Insert)
  if (maxSize - minSize === 1) {
    if (oldTextLength > newText.length) {
      let res = Block.getChainFamily(oldText.texts, cursorPosition, 'delete');
      return { ...res, cursor: cursorPosition + 1, type: 'delete' };
    } else {
      let cursor;
      if (
        cursorPosition === minSize &&
        oldText.getContent().slice(0, minSize) === newText.slice(0, minSize)
      ) {
        cursor = cursorPosition;
      } else {
        cursor = cursorPosition - 1;
      }

      let res = Block.getChainFamily(oldText.texts, cursor, 'insert');

      return {
        ...res,
        cursor,
        target: new Text('Tristan', newText[cursor]),
        type: 'insert',
      };
    }
  } else if (maxSize - minSize >= 1) {
    if (oldTextLength > newText.length) {
      let { target } = Block.getChainFamily(
        oldText.texts,
        cursorPosition,
        'index'
      );
      let deleteMap = oldText.getDeleteMap(target.next, maxSize - minSize);
      return {
        type: 'deleteMultiple',
        target: deleteMap,
        cursor: cursorPosition + (maxSize - minSize),
      };
    } else {
      let variance;
      let cursor;
      console.log(oldText.getContent());
      console.log(newText);
      console.log(cursorPosition);
      if (cursorPosition === minSize) {
        cursor = cursorPosition;
        variance = newText.slice(
          cursorPosition,
          cursorPosition + (maxSize - minSize)
        );
      } else {
        cursor = cursorPosition - (maxSize - minSize);
        variance = newText.slice(
          cursorPosition - (maxSize - minSize),
          cursorPosition
        );
      }
      console.log(variance);
      console.log(oldText.getContent());
      console.log(newText);
      console.log(cursor);
      let res = Block.getChainFamily(oldText.texts, cursor, 'insert');

      let insertMap = [];
      for (let i = 0; i < variance.length; i++) {
        insertMap.push(new Text('Tristan', variance[i]));
      }
      return {
        ...res,
        cursor,
        target: insertMap,
        type: 'insertMultiple',
      };
    }
  }
};

const backspaceRemoveType = (type) => {
  let removeTypeGroup = [
    'header-one',
    'header-two',
    'header-three',
    'header-four',
    'header-five',
    'header-six',
    'blockquote',
  ];
  if (removeTypeGroup.includes(type)) {
    return true;
  }
};

function timeSince(date) {
  var seconds = Math.floor((new Date() - Date.parse(date)) / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' year ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' month ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' day ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hour ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minute ago';
  }
  return Math.floor(seconds) + ' second ago';
}

export { textDiff, backspaceRemoveType, timeSince };
