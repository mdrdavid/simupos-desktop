/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBusinessGrowth } from "@/src/hooks/useBusinessGrowth";
import { Settings } from "lucide-react";
import { BusinessGrowthSettings } from "@/src/types/business-growth";

const formSchema = z
  .object({
    openingCapital: z.coerce.number().positive("Amount must be positive"),
    financialYearStart: z.string().nonempty("Start date is required"),
    financialYearEnd: z.string().nonempty("End date is required"),
  })
  .refine(
    (data) => new Date(data.financialYearEnd) > new Date(data.financialYearStart),
    {
      message: "End date must be after start date",
      path: ["financialYearEnd"],
    }
  );

type FinancialYearSettingsFormProps = {
  onSuccess: () => void;
};

export const FinancialYearSettingsForm = ({
  onSuccess,
}: FinancialYearSettingsFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setOpeningCapital, getFinancialYearSettings, loading } =
    useBusinessGrowth();
  const [settings, setSettings] = useState<BusinessGrowthSettings | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openingCapital: 0,
      financialYearStart: "",
      financialYearEnd: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const currentSettings = await getFinancialYearSettings();
      if (currentSettings) {
        setSettings(currentSettings);
        form.reset({
          openingCapital: currentSettings.openingCapital,
          financialYearStart: new Date(currentSettings.financialYearStart)
            .toISOString()
            .split("T")[0],
          financialYearEnd: new Date(currentSettings.financialYearEnd)
            .toISOString()
            .split("T")[0],
        });
      }
    };

    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, getFinancialYearSettings, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await setOpeningCapital(
      values.openingCapital,
      new Date(values.financialYearStart),
      new Date(values.financialYearEnd)
    );
    if (result) {
      onSuccess();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Financial Year Settings</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="openingCapital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Capital</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialYearStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Year Start</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="financialYearEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Year End</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};