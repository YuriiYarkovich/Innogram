import { Ref } from 'react';
import { ChatContextMenuState, ChatMenuAction } from '@/app/chat/page';
import { ChatTypes } from '@/types';

type ChatContextMenuProps = {
  menuRef: Ref<HTMLDivElement> | undefined;
  contextMenuPosition: ChatContextMenuState;
  handleMenuAction: (action: ChatMenuAction) => void;
  isCurrentProfileAdmin?: boolean;
  chatType?: ChatTypes;
};

const ChatContextMenu = ({
  menuRef,
  contextMenuPosition,
  handleMenuAction,
  isCurrentProfileAdmin = false,
  chatType,
}: ChatContextMenuProps) => {
  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: `${contextMenuPosition.y}px`,
        left: `${contextMenuPosition.x}px`,
      }}
      className="bg-[white] rounded-4xl shadow-lg border border-gray-200 py-2 min-w-48 z-50"
    >
      <button
        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2"
        onClick={() => handleMenuAction('info')}
      >
        <span>ℹ️</span>
        <span>Info</span>
      </button>
      {(isCurrentProfileAdmin || chatType === ChatTypes.PRIVATE) && (
        <>
          {' '}
          <hr className="my-2 border-gray-200" />
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
            onClick={() => handleMenuAction('delete')}
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>{' '}
        </>
      )}
    </div>
  );
};

export default ChatContextMenu;
