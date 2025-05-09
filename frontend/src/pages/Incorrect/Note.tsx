import { useState } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import BoldIcon from '@/assets/icons/bold.svg?react';
import ItalicIcon from '@/assets/icons/italic.svg?react';
import ListIcon from '@/assets/icons/list.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';

const Note = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleClear = () => setEditorState(EditorState.createEmpty());
  const handleBold = () =>
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  const handleItalic = () =>
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  const handleList = () =>
    setEditorState(
      RichUtils.toggleBlockType(editorState, 'unordered-list-item')
    );

  return (
    <div className='bg-white rounded-3xl p-6 shadow-sm flex flex-col h-full'>
      <div className='text-lg font-bold text-[#754AFF] mb-2'>문제별 노트</div>
      <div className='flex items-center gap-6 mb-2'>
        <button
          type='button'
          className='text-gray-700 hover:text-[#754AFF] text-lg cursor-pointer'
          onClick={handleBold}
        >
          <BoldIcon />
        </button>
        <button
          type='button'
          className='text-gray-700 hover:text-[#754AFF] text-lg cursor-pointer'
          onClick={handleItalic}
        >
          <ItalicIcon />
        </button>
        <button
          type='button'
          className='text-gray-700 hover:text-[#754AFF] text-lg cursor-pointer'
          onClick={handleList}
        >
          <ListIcon />
        </button>
        <div className='flex-1' />
        <button
          type='button'
          className='text-gray-700 text-lg hover:text-red-600 cursor-pointer'
          onClick={handleClear}
        >
          <TrashIcon />
        </button>
      </div>
      <div className='border-b border-gray-700 mb-2' />
      <div className='flex-1 text-sm'>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          placeholder={`나만의 해설이나 메모를 기록해보세요.`}
        />
      </div>
    </div>
  );
};

export default Note;
