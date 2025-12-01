import CrossAngleButton from '@/components/crossAngle.button';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { MessageSendFormValues } from '@/app/chat/[chatId]/page';
import { useSocket } from '@/hooks/useSocket';
import { Profile } from '@/types';

const MessageWritingModal = ({
  isOpen,
  onClose,
  currentProfile,
  receiverProfileId,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: Profile | null;
  receiverProfileId: string;
}) => {
  if (!isOpen) return null;
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<MessageSendFormValues>({
    defaultValues: {
      content: '',
      file: null,
    },
  });
  const file = watch('file');

  const { send } = useSocket();

  const onSubmit = async (messageData: MessageSendFormValues) => {
    send({
      event: 'message',
      data: {
        senderId: currentProfile?.id,
        receiverId: receiverProfileId,
        content: messageData.content,
      },
    });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <CrossAngleButton onClose={onClose} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={
          'flex flex-col items-center min-h-1/3 min-w-1/4 bg-[#eaddff] rounded-[37px] pt-6'
        }
      >
        <div className={'flex flex-row w-full ml-8 gap-3'}>
          <div className={'flex md:w-[50px] md:h-[50px] rounded-full'}>
            <Image
              src={currentProfile?.avatarUrl || '/images/avaTest.png'}
              alt={'Author avatar url'}
              height={50}
              width={50}
              draggable={false}
              unoptimized
              className={'rounded-[inherit]'}
            />
          </div>
          <textarea
            {...register('content')}
            className={
              'bg-white w-7/9 h-[100px] p-1.5 outline-1 outline-black rounded-2xl'
            }
            placeholder={'Write message'}
          />
        </div>
        <button
          type={'submit'}
          className={
            'cursor-pointer bg-[#4f378a] text-white hover:text-black text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] mt-5 w-1/4'
          }
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default MessageWritingModal;
