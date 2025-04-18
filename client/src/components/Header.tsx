import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">USA States Tracker</h1>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
