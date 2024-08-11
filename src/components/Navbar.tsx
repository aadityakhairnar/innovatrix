"use client";

import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Darkmodebutton } from "./ui/Darkmodebutton";
import Link from "next/link";

const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-row items-center gap-10 justify-between my-2 mx-10">
      <div className="flex flex-row items-center justify-start gap-6">
        <Link href="/">
        <svg width="148" height="22" viewBox="0 0 148 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26.5 18H24V4H26.5V18ZM39.9922 4L42.4922 4.02V18.02L39.9922 16.1L30.9922 9.16V18.02H28.4922V4.06L30.9922 5.98L39.9922 12.92V4ZM55.9883 4L58.4883 4.02V18.02L55.9883 16.1L46.9883 9.16V18.02H44.4883V4.06L46.9883 5.98L55.9883 12.92V4ZM67.0044 4C70.8644 4 74.0044 7.14 74.0044 11C74.0044 14.86 70.8644 18 67.0044 18C63.1444 18 60.0044 14.86 60.0044 11C60.0044 7.14 63.1444 4 67.0044 4ZM67.0044 15.5C69.4844 15.5 71.5044 13.48 71.5044 11C71.5044 8.52 69.4844 6.5 67.0044 6.5C64.5244 6.5 62.5044 8.52 62.5044 11C62.5044 13.48 64.5244 15.5 67.0044 15.5ZM86.1834 4H88.9834L87.7034 6.5L81.8434 18L75.9834 6.5L74.7034 4H77.5034L78.7834 6.5L81.8434 12.5L84.9034 6.5L86.1834 4ZM98.1336 15.5L99.4136 18H96.6136L95.3336 15.5L92.2736 9.5L89.2136 15.5L87.9336 18H85.1336L86.4136 15.5L92.2736 4L98.1336 15.5ZM96.6563 4.02H110.636V6.52H104.896V18.02H102.396V6.52H96.6563V4.02ZM121.952 11.54L123.952 15.54L125.232 18.04H122.432L121.152 15.54L119.812 12.92L119.752 12.8C119.312 12.08 118.532 11.6 117.632 11.6H115.132V18.04H112.632V4.04H121.472C122.512 4.04 123.452 4.46 124.132 5.14C124.812 5.82 125.232 6.76 125.232 7.8C125.232 9.32 124.332 10.64 123.032 11.24C122.692 11.4 122.332 11.5 121.952 11.54ZM115.132 9.12L121.472 9.1C121.652 9.1 121.832 9.06 121.992 8.98C122.452 8.78 122.752 8.32 122.752 7.82C122.752 7.36 122.512 7.04 122.372 6.9C122.212 6.74 121.912 6.54 121.472 6.54H115.132V9.12ZM129.762 18H127.262V4H129.762V18ZM131.254 18.06V18.02H131.294L131.254 18.06ZM145.254 18.02V18.06L145.234 18.02H145.254ZM145.254 4.02H145.294L139.874 11.04L145.274 18.02H142.114L138.294 13.08L134.474 18.02H131.314L136.694 11.04L131.274 4.02H134.434L138.274 9L142.114 4.02H145.254Z" fill="currentColor"/>
        <path d="M2.14302 13C1.39267 11.7712 0.997071 10.3588 1.00002 8.919C1.00002 4.545 4.58202 1 9.00002 1C13.418 1 17 4.545 17 8.919C17.003 10.3588 16.6074 11.7712 15.857 13M12 18L11.87 18.647C11.73 19.354 11.659 19.707 11.5 19.987C11.255 20.4186 10.8583 20.7436 10.387 20.899C10.082 21 9.72002 21 9.00002 21C8.28002 21 7.91802 21 7.61302 20.9C7.14155 20.7444 6.74483 20.4189 6.50002 19.987C6.34102 19.707 6.27002 19.354 6.13002 18.647L6.00002 18M4.38302 16.098C4.29102 15.822 4.24502 15.683 4.25002 15.571C4.25567 15.4552 4.29476 15.3435 4.36256 15.2494C4.43035 15.1554 4.52394 15.083 4.63202 15.041C4.73602 15 4.88202 15 5.17202 15H12.828C13.119 15 13.264 15 13.368 15.04C13.4762 15.0821 13.5699 15.1546 13.6377 15.2489C13.7055 15.3431 13.7445 15.455 13.75 15.571C13.755 15.683 13.709 15.821 13.617 16.098C13.447 16.609 13.362 16.865 13.231 17.072C12.957 17.5046 12.5275 17.8156 12.031 17.941C11.793 18 11.525 18 10.988 18H7.01202C6.47502 18 6.20602 18 5.96902 17.94C5.47268 17.8149 5.0432 17.5042 4.76902 17.072C4.63802 16.865 4.55302 16.609 4.38302 16.098Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.308 10.9999L7.847 6.4789C7.79642 6.3364 7.70225 6.21345 7.57787 6.12747C7.45348 6.04149 7.30518 5.99686 7.154 5.9999C7.00282 5.99686 6.85452 6.04149 6.73013 6.12747C6.60574 6.21345 6.51158 6.3364 6.461 6.4789L5 10.9999M12 5.9999V10.9999M5.538 9.4999H8.769" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="flex flex-row gap-6">
            <NavigationMenuItem>
              <Link href="/" passHref>
                <span
                  className={`relative transition-all duration-300 ${
                    isActive("/")
                      ? "text-[#6265B9] font-bold transform -translate-y-1 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-[#6265B9] after:bottom-[-5px] after:left-0 after:shadow-[0px_4px_10px_rgba(242,201,73,0.5)]"
                      : "hover:text-[#6265B9] hover:transform hover:-translate-y-1"
                  }`}
                >
                  Home
                </span>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/memo" passHref>
                <span
                  className={`relative transition-all duration-300 ${
                    isActive("/memo")
                      ? "text-[#6265B9] font-bold transform -translate-y-1 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-[#6265B9] after:bottom-[-5px] after:left-0 after:shadow-[0px_4px_10px_rgba(242,201,73,0.5)]"
                      : "hover:text-[#6265B9] hover:transform hover:-translate-y-1"
                  }`}
                >
                  Memo
                </span>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-4">
        <Darkmodebutton />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
