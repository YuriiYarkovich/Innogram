import React from 'react';
import Image from 'next/image';

type SearchModalProps = {
  isOpened: boolean;
  onClose: () => void;
};

const SearchModal = ({ isOpened, onClose }: SearchModalProps) => {
  if (!isOpened) return null;
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-xs bg-black/50 min-h-screen`}
    >
      <div
        className={`flex flex-col md:w-[470px] rounded-[30px] bg-[#eaddff] items-center justify-center gap-3`}
      >
        <div className={`flex flex-row items-center w-full md:h-[50px]`}>
          <div className={`flex justify-center md:w-[47px] md:h-[47px] ml-1`}>
            <button type="button" onClick={onClose}>
              <Image
                src={'/images/icons/back.png'}
                alt={'Back arrow icon'}
                height={30}
                width={30}
                className={`hover:md:h-[37px] hover:md:w-[37px]`}
              />
            </button>
          </div>
          <span className={`ml-28 text-[20px]`}>Searching profiles</span>
        </div>

        <div className={'w-full px-7'}>
          <input
            className={'bg-white w-full pl-3 rounded-2xl'}
            placeholder={'Username'}
          />
        </div>
        <div
          className={'flex items-center justify-center px-7.5 mt-2 mb-3 w-full'}
        >
          <div
            className={
              'flex flex-col outline-1 w-full min-h-[200px] max-h-[500px] overflow-y-auto pl-1 pr-1 pt-0.5'
            }
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
