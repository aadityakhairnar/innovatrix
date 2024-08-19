"use client"
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import Link from "next/link";
import Memotable from "@/components/Memotable";


export default function Page() {
  

  return (
    <>
      <Navbar/>
      <div className="mx-20 my-5 flex flex-col">
        <div className="my-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/memo">Memo</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="mx-20 my-2 flex flex-row justify-between items-center">
          <p className=" text-4xl">Memos</p>
          <div >
            <Card className="flex flex-row items-center">
              <CardHeader>
                  <CardTitle>New Memo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-row gap-4 p-4">
                    <Link href="\memo\individual">
                  <Button className="flex flex-row gap-2 bg-warning hover:bg-warning hover:opacity-80">
                      <p>For Individual</p>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                  </Button>
                    </Link>
                    <Link href="/memo/business">
                  <Button className="flex flex-row gap-2 hover:opacity-80">
                      For Business
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                  </Button>
                    </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Memotable/>
      </div>
    </>
  );
}
