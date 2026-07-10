import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type AddFilePlaceholderProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  accept?: string;
  label?: string;
  isIcon?: boolean;
  iconSize?: number;
  rounded?: string;
};

export default function AddFilePlaceholder<T extends FieldValues>({
  control,
  name,
  accept = 'image/*,video/*',
  label = 'Upload file',
  isIcon = false,
  iconSize = 40,
  rounded = 'rounded-[inherit]',
}: AddFilePlaceholderProps<T>) {
  const [preview, setPreview] = useState<File | string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | null) => void,
  ) => {
    const file = e.target.files?.[0] || null;
    setPreview(file);
    onChange(file);
  };

  const handleChangeFile = (onChange: (file: File | string | null) => void) => {
    setPreview(null);
    onChange(null); // Важно: сбрасываем значение в форме
  };

  // Определяем тип превью (File или URL)
  const isFilePreview = preview instanceof File;
  const previewUrl = isFilePreview ? URL.createObjectURL(preview) : preview;

  // Определяем тип файла
  const isImage = isFilePreview
    ? preview.type.startsWith('image/')
    : preview &&
      typeof preview === 'string' &&
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(preview);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        // Синхронизируем preview с value из формы
        useEffect(() => {
          if (value && !preview) {
            setPreview(value);
          } else if (value && !preview) {
            setPreview(value);
          }
        }, [value]);

        return (
          <div className={`w-full h-full ${rounded}`}>
            {!preview ? (
              <div className="flex justify-center items-center w-full h-full">
                {isIcon ? (
                  <label
                    htmlFor={`${name}-upload`}
                    className={`min-h-[${iconSize}px] min-w-[${iconSize}px] cursor-pointer`}
                  >
                    <Image
                      src="/images/icons/add-image.svg"
                      alt="Add file"
                      width={iconSize}
                      height={iconSize}
                      draggable={false}
                    />
                  </label>
                ) : (
                  <label
                    htmlFor={`${name}-upload`}
                    className="cursor-pointer bg-[#4f378a] text-white rounded-[20px] px-6 py-3 hover:bg-[#d0bcff] hover:text-black transition-colors duration-200 flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    <span>{label}</span>
                  </label>
                )}
                <input
                  id={`${name}-upload`}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, onChange)}
                />
              </div>
            ) : (
              <div
                className="relative w-full h-full flex justify-center items-center bg-transparent rounded-[inherit] overflow-hidden group cursor-pointer"
                onClick={() => handleChangeFile(onChange)} // Передаём onChange
              >
                {isImage ? (
                  <Image
                    src={previewUrl as string}
                    alt="preview"
                    draggable={false}
                    fill
                    className="object-cover rounded-[20px] transition-all duration-200 group-hover:brightness-50"
                    unoptimized={true}
                  />
                ) : (
                  <video
                    src={previewUrl as string}
                    className="object-contain w-full h-full rounded-[20px] transition-all duration-200 group-hover:brightness-50"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {isIcon ? (
                    <Image
                      src="/images/icons/add-image.svg"
                      alt="Change file"
                      width={iconSize}
                      height={iconSize}
                      draggable={false}
                      className="drop-shadow-lg"
                    />
                  ) : (
                    <div className="bg-[#4f378a] text-white rounded-[20px] px-6 py-3 hover:bg-[#d0bcff] hover:text-black transition-colors duration-200 flex items-center justify-center min-w-[120px] pointer-events-auto">
                      <span>Change File</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
