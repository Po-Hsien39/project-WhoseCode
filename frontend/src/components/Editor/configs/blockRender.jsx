import Immutable from 'immutable';
import { Code, CodeWrapper } from '../blocks/Code';
import { DefaultDraftBlockRenderMap } from 'draft-js';
import Line from '../blocks/Line';

const blockRenderMap = Immutable.Map({
  'code-block': {
    element: 'div',
    wrapper: <CodeWrapper />,
  },
  'code-block-insert': {
    element: 'div',
    wrapper: <CodeWrapper />,
  },
  'code-block-remove': {
    element: 'div',
    wrapper: <CodeWrapper />,
  },
  'code-block-demo': {
    element: 'div',
    wrapper: <CodeWrapper delete="true" />,
  },
  'code-block-correct': {
    element: 'div',
    wrapper: <CodeWrapper />,
  },
});

function myBlockRenderer(contentBlock) {
  const type = contentBlock.getType();
  if (
    type === 'code-block' ||
    type === 'code-block-insert' ||
    type === 'code-block-remove'
  ) {
    return {
      component: Code,
      editable: true,
    };
  }
  return {
    component: Line,
  };
}

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
export { extendedBlockRenderMap, myBlockRenderer };
