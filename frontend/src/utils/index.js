import Block from '../modules/Block';
import Text from '../modules/Text';
// const lcs = (oldText, newText) => {
//   const oldTextLength = oldText.length;
//   const newTextLength = newText.length;
//   const matrix = [];
//   for (let i = 0; i <= oldTextLength; i++) {
//     matrix[i] = [];
//     for (let j = 0; j <= newTextLength; j++) {
//       matrix[i][j] = 0;
//     }
//   }
//   for (let i = 1; i <= oldTextLength; i++) {
//     for (let j = 1; j <= newTextLength; j++) {
//       if (oldText[i - 1] === newText[j - 1]) {
//         matrix[i][j] = matrix[i - 1][j - 1] + 1;
//       } else {
//         matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
//       }
//     }
//   }
//   return matrix[oldTextLength][newTextLength];
// };

// console.log(lcs('1234', '234'));
// const diff = (oldText, newText) => {
//   const oldTextLength = oldText.length;
//   const newTextLength = newText.length;
//   const matrix = [];
//   for (let i = 0; i <= oldTextLength; i++) {
//     matrix[i] = [];
//     for (let j = 0; j <= newTextLength; j++) {
//       matrix[i][j] = 0;
//     }
//   }
//   for (let i = 1; i <= oldTextLength; i++) {
//     for (let j = 1; j <= newTextLength; j++) {
//       if (oldText[i - 1] === newText[j - 1]) {
//         matrix[i][j] = matrix[i - 1][j - 1] + 1;
//       } else {
//         matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
//       }
//     }
//   }
//   const result = [];
//   let i = oldTextLength;
//   let j = newTextLength;
//   while (i > 0 && j > 0) {
//     if (oldText[i - 1] === newText[j - 1]) {
//       result.push({
//         type: 'equal',
//         value: oldText[i - 1],
//       });
//       i--;
//       j--;
//     } else if (matrix[i - 1][j] > matrix[i][j - 1]) {
//       result.push({
//         type: 'delete',
//         value: oldText[i - 1],
//       });
//       i--;
//     } else {
//       result.push({
//         type: 'insert',
//         value: newText[j - 1],
//       });
//       j--;
//     }
//   }
//   while (i > 0) {
//     result.push({
//       type: 'delete',
//       value: oldText[i - 1],
//     });
//     i--;
//   }
//   while (j > 0) {
//     result.push({
//       type: 'insert',
//       value: newText[j - 1],
//     });
//     j--;
//   }
//   return result;
// };

// console.log(diff('231234135', '2344fk'));

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

export { textDiff };
