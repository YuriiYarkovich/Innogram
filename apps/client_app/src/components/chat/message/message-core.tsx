import React from 'react';
import { MessageVisibilityStatus } from '@innogram/core-microservice/dist/common/enums/message.enum';
import { formatTime } from '@/utils/time';
import { Message } from '@/types';
import Image from 'next/image';

const MessageCore = ({
  message,
  isCurrentUserAuthor,
}: {
  message: Message;
  isCurrentUserAuthor: boolean;
}) => {
  return (
    <div
      className={`flex flex-col gap-2 ${isCurrentUserAuthor ? 'bg-[#eaddff]' : 'bg-[#efefef]'} rounded-[20px] justify-center pb-1.5 min-w-[100px] max-w-[400px]`}
    >
      {message.replyingMessage ? (
        <div
          className={`flex flex-row gap-2  ${isCurrentUserAuthor ? 'bg-[#CDAEFF]' : 'bg-[#C2C2C2]'} h-7/8 ml-3 mt-2.5 mr-4 rounded-[7px]`}
        >
          <div
            className={`min-h-fit ${isCurrentUserAuthor ? 'bg-[#9655FF]' : 'bg-[#686868]'} md:w-[4px] ml-1.5 mt-2 mb-2`}
          />
          {message.replyingMessage.visibleStatus ===
          MessageVisibilityStatus.DELETED ? (
            <span className={'whitespace-nowrap mr-2 pt-4 pb-4'}>
              Message has been deleted
            </span>
          ) : (
            <div className={'flex flex-col gap-1.5 w-full h-full'}>
              <span className={'font-bold whitespace-nowrap mr-2'}>
                {message.replyingMessage.authorUsername}
              </span>
              <span className={'line-clamp-1'}>
                {message.replyingMessage.content}
              </span>
            </div>
          )}
        </div>
      ) : null}

      <div
        className={
          'flex flex-row min-w-[150px] pl-3 items-center pr-2.5 pt-2 pb-2'
        }
      >
        <span className={'text-[17px] w-full'}>{message.content}</span>

        <div className={'flex flex-col gap-0.5 ml-auto pl-3'}>
          <span className={'flex text-[15px] text-[#79747e]'}>
            {message.createdAt ? formatTime(message.createdAt) : ''}
          </span>
          {message.isEdited && (
            <span className={'flex text-[15px] text-[#79747e]'}>Edited</span>
          )}
        </div>
      </div>

      {message.messageAssets && message.messageAssets.length > 0 && (
        <div className={'flex flex-col gap-2 px-3 pb-2'}>
          {message.messageAssets
            .sort((a, b) => a.order - b.order)
            .map((asset, index) => {
              if (!asset.url) return null;

              // Убираем query параметры для проверки расширения
              const urlWithoutQuery = asset.url.split('?')[0];
              const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(urlWithoutQuery);
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                urlWithoutQuery,
              );

              if (isVideo) {
                return (
                  <video
                    key={index}
                    src={asset.url}
                    controls
                    className={'w-full rounded-[12px] max-h-[300px]'}
                  />
                );
              } else if (isImage) {
                return (
                  <Image
                    key={index}
                    width={400}
                    height={300}
                    src={asset.url}
                    alt={`attachment-${index}`}
                    className={
                      'w-full h-auto rounded-[12px] object-cover max-h-[300px]'
                    }
                    draggable={false}
                    unoptimized
                  />
                );
              }

              return null;
            })}
        </div>
      )}
    </div>
  );
};

export default MessageCore;
