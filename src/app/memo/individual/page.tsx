"use client"
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Indiform } from "@/components/forms/Indiform";

export default function Page() {
  

  return (
    <>
        <div>
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
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="\memo\individual">Loan Application</BreadcrumbLink>
                    </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                </div>
                <div className="mx-20 my-5 flex flex-col justify-between items-center">
                <p className="text-4xl font-semibold">Loan Application</p>
                <p>Individual</p>
                </div>
                <div className="border m-4 p-8">
                    <Indiform/>
                </div>
            </div>
        </div>
    </>
  );
}
