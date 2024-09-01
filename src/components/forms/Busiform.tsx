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
  companyName: z.string().min(2, { message: "Applicant Name must be at least 2 characters." }),
  annualIncome: z.preprocess((value) => Number(value), z.number().min(0, { message: "Annual income must be a positive number." })),
  loanAmount: z.preprocess((value) => Number(value), z.number().min(0, { message: "Loan amount must be a positive number." })),
  loanPurpose: z.string().min(2, { message: "Loan Purpose must be at least 2 characters." }),
  loanType: z.string(),
  loanTerm: z.number().min(1, { message: "Loan Term must be at least 1." }),
  sector: z.string().min(2, { message: "Sector must be at least 2 characters." }),
  gstin: z.string().min(2, { message: "GSTIN must be at least 2 characters." }),
  ifsc: z.string().min(2, { message: "IFSC must be at least 2 characters." }),
  loanApplication: z.instanceof(File, { message: "Loan Application is required." }).optional(),
  bankStatement: z.instanceof(File, { message: "Bank Statement is required." }).optional(),
  creditScoreCertificate: z.instanceof(File, { message: "Credit Score Certificate is required." }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function Busiform() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memo_id, setMemo_id] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      annualIncome: 0,
      loanAmount: 0,
      loanPurpose: "",
      sector: "",
      gstin: "",
      ifsc: "",
      loanType: "",
      loanTerm: 1,
      loanApplication: undefined,
      bankStatement: undefined,
      creditScoreCertificate: undefined,
    },
  });

  async function onSubmit(values: FormData) {
    console.log("Form submitted");
    setIsSubmitting(true);
    setError(null); // Reset any previous errors
    const formData = new FormData();

    formData.append("companyName", values.companyName);
    formData.append("annualIncome", values.annualIncome.toString());
    formData.append("loanAmount", values.loanAmount.toString());
    formData.append("loanPurpose", values.loanPurpose);
    formData.append("sector", values.sector);
    formData.append("gstin", values.gstin);
    formData.append("ifsc", values.ifsc);
    formData.append("loanType", values.loanType);
    formData.append("loanTerm", values.loanTerm.toString());
    if (values.loanApplication) {
      formData.append("loanApplication", values.loanApplication);
    }
    if (values.bankStatement) {
      formData.append("bankStatement", values.bankStatement);
    }
    if (values.creditScoreCertificate) {
      formData.append("creditScoreCertificate", values.creditScoreCertificate);
    }

    try {
      const response = await fetch('http://localhost:5000/process-business-loan', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
    
      if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
      }
    
      const data = await response.json();
      console.log('Server response:', data); // Log the response
      setMemo_id(data.memo_id); 
      router.push(`/memo/business/generatedMemo?memo_id=${data.memo_id}`);
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
          name="companyName"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
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
          name="sector"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>sector</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gstin"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>gstin</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ifsc"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel>ifsc</FormLabel>
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
              <Input {...field} />

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
        
        

        {["loanApplication", "bankStatement", "creditScoreCertificate"].map((name) => (
          <Controller
            key={name}
            name={name as "loanApplication" | "bankStatement" | "creditScoreCertificate"}
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
        {memo_id && <div className="text-green-500">
          Form submitted successfully! Memo ID: {memo_id}
          </div>}
        {error && <div className="text-red-500">Error: {error}</div>}
      </form>
    </Form>
  );
}
