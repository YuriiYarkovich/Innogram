type SeparatorProps = {
  stripColor: string;
};

export default function Separator({ stripColor }: SeparatorProps) {
  return (
    <div className="flex items-center my-6 w-full">
      <div className={`flex-grow h-[2px] ${stripColor}`}></div>
      <span className="px-2 text-[#4a4458] text-[22px]">OR</span>
      <div className={`flex-grow h-[2px] ${stripColor}`}></div>
    </div>
  );
}
