import Immutable from 'immutable';
import { Code, CodeWrapper } from '../blocks/Code';
import { DefaultDraftBlockRenderMap } from 'draft-js';

const blockRenderMap = Immutable.Map({
  'code-block': {
    element: 'div',
    wrapper: <CodeWrapper />,
  },
});

function myBlockRenderer(contentBlock) {
  const type = contentBlock.getType();
  if (type === 'code-block') {
    return {
      component: Code,
      editable: true,
    };
  }
}

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
export { extendedBlockRenderMap, myBlockRenderer };
