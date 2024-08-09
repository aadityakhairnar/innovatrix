import React from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Assuming this is your custom Input component

// Define the schema for the form using Zod
const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  loanAmount: z.number().min(1, { message: "Loan amount must be at least 1." }),
  loanType: z.string(),
  bankApplication: z.any().refine(file => file instanceof File, { message: "Bank Application is required." }),
  incomeCertificate: z.any().refine(file => file instanceof File, { message: "Income Certificate is required." }),
  aadharCard: z.any().refine(file => file instanceof File, { message: "Aadhar Card is required." }),
  panCard: z.any().refine(file => file instanceof File, { message: "Pan Card is required." }),
});

type FormData = z.infer<typeof formSchema>;

export function Indiform() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      loanAmount: 1,
      loanType: "",
      bankApplication: null,
      incomeCertificate: null,
      aadharCard: null,
      panCard: null,
    },
  });

  async function onSubmit(values: FormData) {
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("name", values.name);
    formData.append("loanAmount", values.loanAmount.toString());
    formData.append("loanType", values.loanType);
    formData.append("bankApplication", values.bankApplication);
    formData.append("incomeCertificate", values.incomeCertificate);
    formData.append("aadharCard", values.aadharCard);
    formData.append("panCard", values.panCard);

    
  try {
    const response = await fetch('/memo/individual', {
      method: 'POST',
      body: formData,
    });

    const text = await response.text(); // Try to get text first to see what is being returned
    try {
      const data = JSON.parse(text);
      console.log('Success:', data);
    } catch (error) {
      console.error('Failed to parse JSON:', text);
      throw error; // Rethrow to handle it in the outer catch block
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

  } catch (error) {
    console.error('Error:', error);
  }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Standard input fields */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
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
              <FormMessage>{error && error.message}</FormMessage>
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

        {/* File input handling */}
        {["bankApplication", "incomeCertificate", "aadharCard", "panCard"].map((name) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            rules={{ required: "This file is required" }}
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
    </>
  );
}
