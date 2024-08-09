import Dashboard from "@/components/Dashboard";
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <main className=" m-0">
      <Navbar/>
      <Dashboard/>
    </main>
  );
}
