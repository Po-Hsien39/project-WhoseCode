import { EditorBlock } from 'draft-js';
import { useEffect, useState } from 'react';

const Line = (props) => {
  const [displayRow, setDisplayRow] = useState(true);
  const [number, setNumber] = useState(null);
  useEffect(() => {
    const { block, contentState } = props;
    const blockLists = contentState.getBlockMap().toList();
    let num = 0;
    if (!block.getType().includes('correct')) {
      setDisplayRow(false);
      return;
    }
    for (let i = 0; i < blockLists.length; i++) {
      if (blockLists.get(i).getKey() === block.getKey()) {
        num++;
        break;
      } else {
        if (blockLists.get(i).getType().includes('correct')) {
          num++;
        }
      }
    }
    setNumber(num);
  }, [props]);

  return (
    <div className="line" data-line-number={number}>
      <div className="line-text">
        <EditorBlock {...props} />
      </div>
    </div>
  );
};

// class Line extends React.Component {
//   render() {
//     const { block, contentState } = this.props;
//     const lineNumber =
//       contentState
//         .getBlockMap()
//         .toList()
//         .findIndex((item) => item.key === block.key) + 1;
//     return (
//       <div className="line" data-line-number={lineNumber}>
//         <div className="line-text">
//           <EditorBlock {...this.props} />
//         </div>
//       </div>
//     );
//   }
// }

export default Line;
