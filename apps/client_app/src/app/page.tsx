import Image from "next/image";

export default function Home() {
    return (
        <div className="flex flex-row min-h-screen justify-center gap-[220px]">
            {/* Левая картинка */}
             {/*<div className="flex flex-col justify-center items-center">
                 Вставь ссылку на левую картинку
                <Image
                    src="/images/left.png"
                    alt="Left side"
                    width={380}
                    height={460}
                />
            </div>*/}

            {/* Центральная форма */}

            <div className="flex md:w-[450px] flex-col items-center justify-center min-h-screen">
                <div
                    className="w-full md:h-[350px] rounded-[36px] flex flex-col justify-center items-center bg-[#eaddff] pr-[30px] pl-[30px]">
                    {/* Логотип */}
                    <div className="mb-6">
                        {/* Вставь ссылку на логотип */}
                        <Image src="/images/logo.png" alt="Logo" width={340} height={70}/>
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
                            className="bg-[#4f378a] text-white py-2 rounded-[20px] hover:bg-[#d0bcff]"
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
                            className="flex flex-row items-center justify-center gap-[25px] md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px] hover:border-[#79747e]">
                            {/* Лого Google */}
                            <Image
                                src="/images/google-logo.svg"
                                alt="Google"
                                width={28}
                                height={28}
                            />
                            <span className="text-[20px]">Sign in with Google</span>
                        </button>
                        <button
                            className="flex items-center justify-center md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px] py-2 hover:border-[#79747e]">
                            <span className="text-[22px]">Sign up using email</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Правая картинка */}
            {/*<div className="flex flex-col justify-center items-center">
                Вставь ссылку на левую картинку
                <Image
                    src="/images/right.png"
                    alt="right side"
                    width={380}
                    height={460}
                />
            </div>*/}
        </div>
    );
}
