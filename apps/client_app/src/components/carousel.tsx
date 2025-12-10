import Image from 'next/image';

type CarouselProps = {
  currentIndex: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
  children: React.ReactNode;
  indicators?: React.ReactNode[];
  className?: string;
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
}: CarouselProps) {
  return (
    <>
      <div className={`relative flex justify-center items-center ${className}`}>
        {/* Left arrow */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
          >
            <Image
              src="/images/icons/back.png"
              alt="Previous"
              width={24}
              height={24}
            />
          </button>
        )}

        {/* Content */}
        <div className="w-full h-full">{children}</div>

        {/* Right arrow */}
        {currentIndex < totalItems - 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
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
      <div className="flex gap-2 mt-3">
        {indicators ||
          Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-[#4f378a] w-4' : 'bg-gray-300'
              }`}
            />
          ))}
      </div>
    </>
  );
}
