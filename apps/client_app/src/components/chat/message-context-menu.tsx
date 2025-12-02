import { Ref } from 'react';
import { ContextMenuPosition } from '@/components/chat/messageTile';

type MessageContextMenuProps = {
  menuRef: Ref<HTMLDivElement> | undefined;
  contextMenuPosition: ContextMenuPosition;
};
const MessageContextMenu = ({
  menuRef,
  contextMenuPosition,
}: MessageContextMenuProps) => {
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
      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2">
        <span>✏️</span>
        <span>Edit</span>
      </button>

      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2">
        <span>🔗</span>
        <span>Reply</span>
      </button>

      <hr className="my-2 border-gray-200" />

      <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
        <span>🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );
};

export default MessageContextMenu;
