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
import Link from 'next/link';

const formSchema = z.object({
  applicantName: z.string().min(2, { message: "Applicant Name must be at least 2 characters." }),
  applicantAge: z.string().min(2, { message: "Applicant Age must be at least 2 characters." }),
  annualIncome: z.number().min(0, { message: "Loan amount must be at least 1." }),
  loanAmount: z.number().min(0, { message: "Loan amount must be at least 1." }),
  loanPurpose: z.string().min(2, { message: "Loan Purpose must be at least 2 characters." }),
  loanType: z.string(),
  loanTerm: z.number().min(0, { message: "Loan Term must be at least 1." }),
  cibilScore: z.number().min(0, { message: "Cibil Score must be at least 1." }),
  bankApplication: z.instanceof(File, { message: "Bank Application is required." }),
  incomeCertificate: z.instanceof(File, { message: "Income Certificate is required." }),
  aadharCard: z.instanceof(File, { message: "Aadhar Card is required." }),
  panCard: z.instanceof(File, { message: "Pan Card is required." }),
});

type FormData = z.infer<typeof formSchema>;

export function Indiform() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aadhaarValid, setAadhaarValid] = useState<null | boolean>(null);
  const [panValid, setPanValid] = useState<null | boolean>(null);
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: "",
      applicantAge: "",
      annualIncome: 0,
      loanAmount: 0,
      loanPurpose: "",
      loanType: "",
      loanTerm: 0,
      cibilScore: 0,
      bankApplication: undefined,
      incomeCertificate: undefined,
      aadharCard: undefined,
      panCard: undefined,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setError(null); // Reset any previous errors
    const formData = new FormData();

    formData.append("applicantName", values.applicantName);
    formData.append("applicantAge", values.applicantAge);
    formData.append("annualIncome", values.annualIncome.toString());
    formData.append("loanAmount", values.loanAmount.toString());
    formData.append("loanPurpose", values.loanPurpose);
    formData.append("loanType", values.loanType);
    formData.append("loanTerm", values.loanTerm.toString());
    formData.append("cibilScore", values.cibilScore.toString());
    formData.append("bankApplication", values.bankApplication as File);
    formData.append("incomeCertificate", values.incomeCertificate as File);
    formData.append("aadharCard", values.aadharCard as File);
    formData.append("panCard", values.panCard as File);

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

  const handleAadhaarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('aadharCard', file);

      const response = await fetch('/api/validate-aadhaar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setAadhaarValid(result.isValid);
    }
  };

  const handlePanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('panCard', file);

      const response = await fetch('/api/validate-pan', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setPanValid(result.isValid);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} method="POST" encType="multipart/form-data" className=' border-2 rounded-lg grid grid-cols-2 '>
      <div className=' col-span-2 p-4 bg-warning rounded-t-lg text-[#ffffff] border-2'>
          <h1 className="text-2xl font-semibold">Personal details</h1>
        </div>
      <FormField
          control={form.control}
          name="applicantName"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4 '>
              <FormLabel  className='text-lg'>Applicant Name</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' placeholder="Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="applicantAge"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>Applicant Age</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' placeholder="Age" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annualIncome"
          render={({ field, fieldState: { error } }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>Annual Income</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' type="number" placeholder="Annual Income" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
              <FormLabel className='text-lg'>Loan Amount</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' type="number" placeholder="Loan Amount" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
              <FormLabel className='text-lg'>Loan Purpose</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' placeholder="Loan Purpose" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

          <FormField
          control={form.control}
          name="loanType"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>LoanType</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className=' hover:border-2 hover:border-warning-secondary'>
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
              <FormLabel className='text-lg'>Loan Term</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' type="number" placeholder="Loan Terms in Months" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cibilScore"
          render={({ field, fieldState: { error } }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>Cibil Score</FormLabel>
              <FormControl>
                <Input className=' hover:border-2 hover:border-warning-secondary' type="number" placeholder="Cibil Score" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />
        <div className=' col-span-2 p-4 bg-warning text-[#ffffff] border-2'>
          <h1 className="text-2xl font-semibold">Documents</h1>
        </div>
        <FormField
          control={form.control}
          name="aadharCard"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>Aadhar Card (Image)</FormLabel>
              <FormControl>
                <Input
                  className=' hover:border-2 hover:border-warning-secondary hover:cursor-pointer'
                  type="file"
                  accept="image/jpeg, image/png"
                  placeholder="Upload Aadhar Card in JPEG/PNG format"
                  onChange={(e) => {
                    field.onChange(e.target.files ? e.target.files[0] : null);
                    handleAadhaarChange(e);
                  }}
                />
              </FormControl>
              {aadhaarValid === false && (
                <FormMessage>Aadhaar card is invalid. Please upload a valid Aadhaar card.</FormMessage>
              )}
              {aadhaarValid === true && (
                <div className="text-green-500">Aadhaar card is valid!</div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="panCard"
          render={({ field }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>PAN Card (Image)</FormLabel>
              <FormControl>
                <Input
                  className=' hover:border-2 hover:border-warnin-secondary hover:cursor-pointer'
                  type="file"
                  accept="image/jpeg, image/png"
                  placeholder="Upload Pan Card in JPEG/PNG format"
                  onChange={(e) => {
                    field.onChange(e.target.files ? e.target.files[0] : null);
                    handlePanChange(e); // Trigger PAN validation
                  }}
                />
              </FormControl>
              {panValid === false && (
                <FormMessage>PAN card is invalid. Please upload a valid PAN card.</FormMessage>
              )}
              {panValid === true && (
                <div className="text-green-500">PAN card is valid!</div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankApplication"
          render={({ field, formState: { errors } }) => (
            <FormItem className='col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>Bank Application (PDF)</FormLabel>
              <FormControl>
                <Input
                  className=' hover:border-2 hover:border-warning-secondary hover:cursor-pointer'
                  type="file"
                  accept="application/pdf"
                  placeholder='Upload Bank Application in PDF format'
                  onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              {errors.bankApplication && <FormMessage>{errors.bankApplication.message}</FormMessage>}
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="incomeCertificate"
          render={({ field, formState: { errors } }) => (
            <FormItem className=' col-span-1 row-span-1 p-4'>
              <FormLabel className='text-lg'>Income Certificate (PDF)</FormLabel>
              <FormControl>
              <Input
                    className=' hover:border-2 hover:border-warning-secondary hover:cursor-pointer'
                    type="file"
                    accept="application/pdf"
                    placeholder='Upload Income Certificate in PDF format'
                    onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                  />
              </FormControl>
              {errors.incomeCertificate && <FormMessage>{errors.incomeCertificate.message}</FormMessage>}
            </FormItem>
          )}
        />
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
      <Link href={'/memo/individual/generatedMemo'}>
      <Button>
        Skip
      </Button>
      </Link>
    </Form>
  );
}
