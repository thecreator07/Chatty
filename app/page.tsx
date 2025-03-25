import NavigateButton from "components/NavigateButton";
import { ModeToggle } from "components/Theme-Toggle";

export default function Home() {
  return (
    <>
      <main className="flex-grow min-h-screen flex flex-col items-center justify-center px-4 md:px-24 bg-gray-100">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Dive into the World of Ai Chat
          </h1>
          <p className="mt-3 md:mt-4 text-green-500 dark:text-white text-3xl md:text-5xl font-bold">
          The Chatty
          </p>
        </section>
        <NavigateButton />
        <ModeToggle/>
      </main>
    </>
  );
}
