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
  

const Dashboard = () => {
    return (
        <div className="mx-20 my-10 flex flex-col">
            <div className="flex flex-row justify-between w-full h-16">
            <h1 className=" text-4xl">Welcome Emily</h1>
            <Button size="icon" className="rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
                </svg>  
            </Button>

            </div>
            <div className="flex flex-row justify-between h-[60%] gap-4 my-4">
                <div>
                    <Recentac/>
                </div>
                <div className="h-full">
                    <Totalapp/>
                </div>
                <div className="h-full">
                    <Typeofloan/>
                </div>
            </div>
            <div className="flex flex-row justify-between gap-4 h-[30%]">
                <div className=" w-[15%]">
                <Card>
                    <CardHeader>
                        <CardTitle>New Memo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button>For Individual</Button>
                        <Button>For Business</Button>
                    </CardContent>
                </Card>
                </div>
                <div className="m-0 p-0">
                <IndivsBusichart/>
                </div>
                <div className=" w-[15%]">
                <Card>
                    <CardHeader>
                        <CardTitle>Processing Time</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <p> Average : 14 days</p>
                        <p> Maximum : 14 days</p>
                        <p> Minimum : 14 days</p>
                    </CardContent>
                </Card>
                </div>
                <div>
                    <Approvchart/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;