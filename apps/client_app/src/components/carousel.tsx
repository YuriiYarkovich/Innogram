import Image from 'next/image';
import React from 'react';

type CarouselProps = {
  currentIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  children: React.ReactNode | React.ReactNode[];
  indicators?: React.ReactNode[];
  className?: string;
  showArrows?: boolean;
};

export default function Carousel({
  currentIndex,
  totalItems,
  onPrev,
  onNext,
  onSelectIndex,
  children,
  indicators,
  className = '',
  showArrows = true,
}: CarouselProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <>
      <div className={`relative flex justify-center items-center ${className}`}>
        {/* Left arrow */}
        {showArrows && currentIndex > 0 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
          >
            <Image
              src="/images/icons/back.png"
              alt="Previous"
              width={24}
              height={24}
            />
          </button>
        )}

        {/* Showing only current element */}
        <div
          className={`w-full h-full flex items-center justify-center overflow-hidden`}
        >
          {childrenArray[currentIndex]}
        </div>

        {/* Right arrow */}
        {showArrows && currentIndex < totalItems - 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all scale-70 hover:scale-90"
          >
            <Image
              src="/images/icons/back.png"
              alt="Next"
              width={24}
              height={24}
              className="rotate-180"
            />
          </button>
        )}
      </div>

      {/* Indicators */}
      {totalItems > 1 && (
        <div className="flex gap-2 mt-3 justify-center">
          {indicators ||
            Array.from({ length: totalItems }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-[#4f378a] w-8'
                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
              />
            ))}
        </div>
      )}
    </>
  );
}
