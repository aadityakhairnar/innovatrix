import React, { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  businessName: z.string().min(2, { message: "Applicant Name must be at least 2 characters." }),
  annualIncome: z.number().min(0, { message: "Loan amount must be at least 1." }),
  loanAmount: z.number().min(0, { message: "Loan amount must be at least 1." }),
  loanPurpose: z.string().min(2, { message: "Loan Purpose must be at least 2 characters." }),
  loanType: z.string(),
  loanTerm: z.number().min(1, { message: "Loan Term must be at least 1." }),
  bankApplication: z.instanceof(File, { message: "Bank Application is required." }).optional(),
  incomeCertificate: z.instanceof(File, { message: "Income Certificate is required." }).optional(),
  creditScoreReport: z.instanceof(File, { message: "Income Certificate is required." }).optional(),

});

type FormData = z.infer<typeof formSchema>;

export function Busiform() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aadhaarValid, setAadhaarValid] = useState<null | boolean>(null);
  const [panValid, setPanValid] = useState<null | boolean>(null);
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      annualIncome: 0,
      loanAmount: 0,
      loanPurpose: "",
      loanType: "",
      loanTerm: 1,
      bankApplication: undefined,
      incomeCertificate: undefined,
      creditScoreReport: undefined,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setError(null); // Reset any previous errors
    const formData = new FormData();

    formData.append("applicantName", values.businessName);
    formData.append("annualIncome", values.annualIncome.toString());
    formData.append("loanAmount", values.loanAmount.toString());
    formData.append("loanPurpose", values.loanPurpose);
    formData.append("loanType", values.loanType);
    formData.append("loanTerm", values.loanTerm.toString());
    formData.append("bankApplication", values.bankApplication as File);
    formData.append("incomeCertificate", values.incomeCertificate as File);
    formData.append("creditScoreReport", values.creditScoreReport as File);

    try {
      const response = await fetch('/api/individual', {
        method: 'POST',
        body: formData, // formData should be a FormData object
      });      

      if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      setMemoId(data.memoId); 
      router.push(`/memo/individual/generatedMemo?memoId=${data.memoId}`) // Set the memoId from the server's response
      console.log('Form submitted successfully with memoId:', data.memoId);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} method="POST" encType="multipart/form-data" className=' border rounded-lg grid grid-cols-2'>
      <div className=' col-span-2 p-4 bg-warning rounded-t-lg text-[#ffffff]'>
          <h1 className="text-2xl font-semibold">Business details</h1>
        </div>
      <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <FormField
          control={form.control}
          name="annualIncome"
          render={({ field, fieldState: { error } }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>Annual Income</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanAmount"
          render={({ field, fieldState: { error } }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>Loan Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanPurpose"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>Loan Purpose</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

          <FormField
          control={form.control}
          name="loanType"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>LoanType</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                  <SelectItem value="Home Loan">Home Loan</SelectItem>
                  <SelectItem value="Car Loan">Car Loan</SelectItem>
                  <SelectItem value="Education Loan">Education Loan</SelectItem>
                  <SelectItem value="Mortgage Loan">Mortgage Loan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanTerm"
          render={({ field, fieldState: { error } }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>Loan Term</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        
        <div className=' col-span-2 p-4 bg-warning text-[#ffffff]'>
          <h1 className="text-2xl font-semibold">Documents</h1>
        </div>
        
        

        {["bankApplication", "incomeCertificate", "creditScoreReport"].map((name) => (
          <Controller
            key={name}
            name={name as "bankApplication" | "incomeCertificate"}
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <FormItem className=' col-span-1 row-span-1 p-4'>
                <FormLabel>{`${name.split(/(?=[A-Z])/).join(" ")} (PDF)`}</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                  />
                </FormControl>
                {error && <FormMessage>{error.message}</FormMessage>}
              </FormItem>
            )}
          />
        ))}
        <div className='col-span-2 flex flex-row p-4'>
        <Button type="submit" disabled={isSubmitting} className='bg-warning text-[#ffffff]'>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        </div>
        {memoId && <div className="text-green-500">
          Form submitted successfully! Memo ID: {memoId}
          </div>}
        {error && <div className="text-red-500">Error: {error}</div>}
      </form>
    </Form>
  );
}
