/* eslint-disable */
import { useState, useEffect, useRef, Component, Fragment } from 'react';
import { useStatus } from '../../hook/useStatus';
import { PrismDraftDecorator } from '../../modules/code-highlight';
import Prism from 'prismjs';
import { BLOCK_TYPES, styleMap, INLINE_STYLES } from '../../constants/constant';
import { myBlockRenderer, extendedBlockRenderMap } from './configs/blockRender';
import { Box, CircularProgress, Typography } from '@mui/material';
import 'prismjs/themes/prism-coy.css';
import '../../css/Editor.css';
import _ from 'lodash';
import { Editor, EditorState, RichUtils, convertFromRaw } from 'draft-js';
const decorations = new PrismDraftDecorator(Prism.languages.javascript);

const DraftJSRichTextEditor = ({ versionNote }) => {
  const [editorState, setEditorState] = useState(null);
  // EditorState.createEmpty(decorations)
  const editorRef = useRef(null);

  useEffect(() => {
    if (versionNote) {
      console.log('raw', versionNote.content);
      const contentState = convertFromRaw(JSON.parse(versionNote.content));
      setEditorState(EditorState.createWithContent(contentState, decorations));
    }
  }, [versionNote]);

  const onChange = (editorState) => {
    setEditorState(editorState);
  };

  const handleKeyCommand = (command, editorState) => {
    console.log(command);
  };

  const onTab = (e) => {
    const maxDepth = 4;
    onChange(RichUtils.onTab(e, editorState, maxDepth));
  };

  const toggleBlockType = (blockType) => {
    console.log('change');
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const focus = () => {
    editorRef.current.focus();
  };

  return (
    <Fragment>
      {editorState ? (
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={toggleInlineStyle}
          />
          <div className={'RichEditor-editor'} onClick={focus}>
            <Editor
              readOnly={true}
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              onChange={onChange}
              onTab={onTab}
              blockRenderMap={extendedBlockRenderMap}
              blockRendererFn={myBlockRenderer}
              // placeholder="Tell a story..."
              ref={editorRef}
              spellCheck={true}
            />
          </div>
        </div>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '35vh',
            width: '100%',
            alignItems: 'center',
          }}>
          <CircularProgress color="secondary" />
          <Typography
            variant="h7"
            sx={{ color: 'gray', marginTop: '25px' }}
            noWrap>
            Please Wait~ Your Note is on the way
          </Typography>
        </Box>
      )}
    </Fragment>
  );
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return 'blockStyle';
  }
}

class StyleButton extends Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

export default DraftJSRichTextEditor;
