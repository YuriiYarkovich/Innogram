import Image from "next/image";

export default function Home() {
    return (
        <div className="flex flex-row min-h-screen justify-center">
            {/* Левая картинка */}
           {/* <div className="flex-1 hidden md:block">
                 Вставь ссылку на левую картинку
                <Image
                    src="/path-to-left-image.jpg"
                    alt="Left side"
                    fill
                    className="w-full h-full"
                />
            </div>*/}

            {/* Центральная форма */}

            <div className="flex md:w-[450px] flex-col items-center justify-center min-h-screen">
                <div
                    className="w-full md:h-[350px] rounded-[36px] flex flex-col justify-center items-center bg-[#eaddff] pr-[30px] pl-[30px]">
                    {/* Логотип */}
                    <div className="mb-6">
                        {/* Вставь ссылку на логотип */}
                        <Image src="/path-to-logo.png" alt="Logo" width={380} height={90}/>
                    </div>

                    {/* Поля ввода */}
                    <form className="w-full flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
                        />
                        <button
                            type="submit"
                            className="bg-[#4f378a] text-white py-2 rounded-[20px]"
                        >
                            Log in
                        </button>
                    </form>
                </div>
                <div className="w-full flex flex-col">
                    {/* Разделитель */}
                    <div className="flex items-center my-6 w-full">
                        <div className="flex-grow h-[2px] bg-[#ded8e1]"></div>
                        <span className="px-2 text-[#4a4458] text-[22px]">OR</span>
                        <div className="flex-grow h-[2px] bg-[#ded8e1]"></div>
                    </div>

                    {/* Кнопки входа */}
                    <div className="flex flex-col gap-3 w-full items-center">
                        <button
                            className="flex flex-row items-center justify-center gap-[25px] md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px]">
                            {/* Лого Google */}
                            <Image
                                src="/images/google-logo.svg"
                                alt="Google"
                                width={28}
                                height={28}
                            />
                            <span className="text-[20px]">Sign in with Google</span>
                        </button>
                        <button className="flex items-center justify-center md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px] py-2">
                            <span className="text-[22px]">Sign up using email</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Правая картинка */}
            {/*<div className="flex-1 hidden md:block bg-red-600">
                Вставь ссылку на правую картинку
                <Image
                    src="/path-to-right-image.jpg"
                    alt="Right side"
                    fill
                    className="object-cover"
                />
            </div>*/}
        </div>
    );
}
