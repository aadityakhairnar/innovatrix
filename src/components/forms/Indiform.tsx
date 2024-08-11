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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  loanAmount: z.number().min(1, { message: "Loan amount must be at least 1." }),
  loanType: z.string(),
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
      username: "",
      name: "",
      loanAmount: 1,
      loanType: "",
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

    formData.append("username", values.username);
    formData.append("name", values.name);
    formData.append("loanAmount", values.loanAmount.toString());
    formData.append("loanType", values.loanType);
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
          name="loanType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Type</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
