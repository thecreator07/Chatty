
import NavBar from "components/NavBar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      {children}
    </div>
  );
}
