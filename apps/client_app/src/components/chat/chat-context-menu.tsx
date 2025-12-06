import { Ref } from 'react';
import {
  MessageContextMenuState,
  ChatMenuAction,
  ChatContextMenuState,
} from '@/app/chat/page';

type ChatContextMenuProps = {
  menuRef: Ref<HTMLDivElement> | undefined;
  contextMenuPosition: ChatContextMenuState;
  handleMenuAction: (action: ChatMenuAction) => void;
};

const ChatContextMenu = ({
  menuRef,
  contextMenuPosition,
  handleMenuAction,
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
      {/* <hr className="my-2 border-gray-200" />*/}
      <button
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
        onClick={() => handleMenuAction('delete')}
      >
        <span>🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );
};

export default ChatContextMenu;
