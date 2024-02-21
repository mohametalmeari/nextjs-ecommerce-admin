import { UserButton } from "@clerk/nextjs";
import MainNav from "./main-nav";

const Navbar = () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div>{/* TODO: Store Switcher */}</div>
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          {/* TODO: Theme Switcher */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
