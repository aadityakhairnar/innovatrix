import { Button } from "@/components/ui/button"
import { Totalapp } from "@/components/homepage/Totalapp";
import { Typeofloan } from "./homepage/Typeofloan";
import Recentac from "./homepage/Recentac";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { IndivsBusichart } from "./homepage/IndivsBusichart";
import { Approvchart } from "./homepage/Approvchart";
import Link from "next/link";
  

const Dashboard = () => {
    return (
        <div className="mx-20 mt-14 flex flex-col">
            <div className="flex flex-row justify-between w-full h-16">
            <h1 className=" text-4xl font-semibold">Welcome Emily</h1>
            <Button size="icon" className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
                </svg>  
            </Button>

            </div>
            <div className="grid grid-cols-12 grid-rows-3 h-[70vh] gap-4">
                <div className=" col-span-3 row-span-2">
                    <Recentac/>
                </div>
                <div className="col-span-4 row-span-2">
                    <Totalapp/>
                </div>
                <div className="col-span-5 row-span-2">
                    <Typeofloan/>
                </div>
                <div className="col-span-2 row-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>New Memo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Link href="/memo/individual">
                        <Button className="flex gap-2 w-full">For Individual
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </Button>
                        </Link>
                        <Link href="/memo/business">
                        <Button className="flex gap-2 w-full">For Business
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                        </Button>
                        </Link>
                    </CardContent>
                </Card>
                </div>
                <div className="col-span-4 row-span-1">
                <IndivsBusichart/>
                </div>
                <div className="col-span-2 row-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Processing Time</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full">
                        <p> Average : 14 days</p>
                        <p> Maximum : 14 days</p>
                        <p> Minimum : 14 days</p>
                    </CardContent>
                </Card>
                </div>
                <div className="col-span-4 row-span-1">
                    <Approvchart/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;