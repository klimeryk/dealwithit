import glassesImageUrl from "./assets/glasses.png";

export default function Title() {
  return (
    <>
      <div className="flex w-full items-center justify-center">
        <span className="absolute mx-auto py-2 flex border w-fit bg-gradient-to-r blur-xl from-blue-500 via-teal-500 to-pink-500 bg-clip-text text-6xl box-content font-extrabold text-transparent text-center select-none">
          Deal With It
        </span>
        <h1 className="relative top-0 w-fit h-auto py-2 justify-center flex bg-gradient-to-r items-center from-blue-500 via-teal-500 to-pink-500 bg-clip-text text-6xl font-extrabold text-transparent text-center select-auto">
          Deal With It
          <img
            className="absolute"
            style={{ width: "100px", top: "31px", left: "102px" }}
            src={glassesImageUrl}
          />
        </h1>
      </div>
      <h2 className="-mt-4 text-lg text-center text-gray-300">
        GIF emoji generator
      </h2>
      <h3 className="leading-relaxed text-sm text-center text-gray-500">
        All done artisanally and securely in your browser.
      </h3>
    </>
  );
}
