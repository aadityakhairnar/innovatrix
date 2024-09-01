"use client"
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Busiform } from "@/components/forms/Busiform";
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
                        <BreadcrumbLink href="\memo\business">Loan Application</BreadcrumbLink>
                    </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                </div>
                <div className="mx-20 my-5 flex flex-col justify-between items-center">
                <p className="text-4xl font-semibold text-warning">Loan Application</p>
                <p>Business</p>
                </div>

                    <Busiform/>
 
                
            </div>
        </div>
    </>
  );
}
