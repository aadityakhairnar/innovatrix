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


const formSchema = z.object({
  applicantName: z.string().min(2, { message: "Applicant Name must be at least 2 characters." }),
  applicantAge: z.string().min(2, { message: "Applicant Age must be at least 2 characters." }),
  education: z.string().min(2, { message: "Education must be at least 2 characters." }),
  annualAmount: z.number().min(1, { message: "Loan amount must be at least 1." }),
  loanAmount: z.number().min(1, { message: "Loan amount must be at least 1." }),
  loanPurpose: z.string().min(2, { message: "Loan Purpose must be at least 2 characters." }),
  loanType: z.string(),
  loanTerm: z.number().min(1, { message: "Loan Term must be at least 1." }),
  cibilScore: z.number().min(1, { message: "Cibil Score must be at least 1." }),
  bankApplication: z.instanceof(File, { message: "Bank Application is required." }).optional(),
  incomeCertificate: z.instanceof(File, { message: "Income Certificate is required." }).optional(),
  aadharCard: z.instanceof(File, { message: "Aadhar Card is required." }).optional(),
  panCard: z.instanceof(File, { message: "Pan Card is required." }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function Indiform() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: "",
      applicantAge: "",
      education: "",
      annualAmount: 1,
      loanAmount: 1,
      loanPurpose: "",
      loanType: "",
      loanTerm: 1,
      cibilScore: 1,
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
    formData.append("education", values.education);
    formData.append("annualAmount", values.annualAmount.toString());
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
      setMemoId(data.memoId);  // Set the memoId from the server's response
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
      <form onSubmit={form.handleSubmit(onSubmit)} method="POST" encType="multipart/form-data">
      <FormField
          control={form.control}
          name="applicantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applicant Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicantAge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Applicant Age</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annualAmount"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Annual Amount</FormLabel>
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
            <FormItem>
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
            <FormItem>
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
            <FormItem>
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
            <FormItem>
              <FormLabel>Loan Term</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cibilScore"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Cibil Score</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage>{error?.message}</FormMessage>
            </FormItem>
          )}
        />

        {["bankApplication", "incomeCertificate", "aadharCard", "panCard"].map((name) => (
          <Controller
            key={name}
            name={name as "bankApplication" | "incomeCertificate" | "aadharCard" | "panCard"}
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <FormItem>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
        {memoId && <div className="text-green-500">Form submitted successfully! Memo ID: {memoId}</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
      </form>
    </Form>
  );
}