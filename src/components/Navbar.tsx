import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
  } from "@/components/ui/navigation-menu"

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Darkmodebutton } from "./ui/Darkmodebutton"
import Link from "next/link"

  
const Navbar = () => {
    return (
        <div className="flex flex-row items-center gap-10 justify-between my-2 mx-2">
            <h3>Loan Generator</h3>
            <div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                    <Link href="\memo">
                            Home
                    </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="\memo">
                            memo
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            </div>
            <div className="flex items-center gap-4">
            <Darkmodebutton/>
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
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
            



        </div>
    );
}

export default Navbar;