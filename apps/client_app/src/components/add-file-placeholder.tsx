import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import Image from 'next/image';
import { useState } from 'react';

type AddFilePlaceholderProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  accept?: string;
  label?: string;
  className?: string;
};

export default function AddFilePlaceholder<T extends FieldValues>({
  control,
  name,
  accept = 'image/*,video/*',
  label = 'Upload file',
  className = '',
}: AddFilePlaceholderProps<T>) {
  const [preview, setPreview] = useState<File | null>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <>
          {!preview ? (
            <div
              className={`flex justify-center items-center md:w-[120px] ${className}`}
            >
              <label
                htmlFor={`${name}-upload`}
                className="cursor-pointer bg-[#4f378a] text-white text-center rounded-[20px] px-4 py-2 hover:bg-[#d0bcff] hover:text-black w-full h-1/5"
              >
                {label}
              </label>
              <input
                id={`${name}-upload`}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPreview(file);
                  onChange(file);
                }}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex justify-center items-center bg-transparent rounded-[inherit]">
              {preview.type.startsWith('image/') ? (
                <Image
                  src={URL.createObjectURL(preview)}
                  alt="preview"
                  draggable={false}
                  fill
                  className="object-cover rounded-[inherit]"
                />
              ) : (
                <video
                  src={URL.createObjectURL(preview)}
                  controls
                  className="object-contain w-full h-full"
                />
              )}
            </div>
          )}
        </>
      )}
    />
  );
}
