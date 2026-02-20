/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import { useWelding } from "@/context/WeldingContext";
import {
  WeldingMaterialNeeded,
  WeldingMaterialStock,
} from "@/src/types/weldingMaterial";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit, Package, Check, ChevronsUpDown, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

const materialSchema = z.object({
  isCustom: z.boolean(),
  name: z.string().min(2, "Name is required."),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive."),
  unit: z.string().min(1, "Unit is required."),
  costPerUnit: z.coerce.number().optional(),
  stockItemId: z.string().optional(),
});

const formSchema = z.object({
  materials: z.array(materialSchema),
});

export type AddMaterialFormValues = z.infer<typeof formSchema>;

interface AddMaterialToJobDialogProps {
  jobId: string;
  initialData?: WeldingMaterialNeeded;
  onUpdate?: (
    materialId: string,
    values: z.infer<typeof materialSchema>
  ) => Promise<void>;
  children: React.ReactNode;
}

export function AddMaterialToJobDialog({
  jobId,
  initialData,
  onUpdate,
  children,
}: AddMaterialToJobDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addMaterialToJob, getAvailableStock } = useWelding();
  const { currentBranchId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableStock, setAvailableStock] = useState<WeldingMaterialStock[]>(
    []
  );
  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);

  const isEditMode = !!initialData;

  const form = useForm<AddMaterialFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materials: initialData
        ? [
            {
              ...initialData,
              costPerUnit: initialData.costPerUnit || undefined,
            },
          ]
        : [
            {
              isCustom: false,
              name: "",
              quantity: 0,
              unit: "",
              costPerUnit: undefined,
              stockItemId: undefined,
            },
          ],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  useEffect(() => {
    if (isOpen && currentBranchId) {
      getAvailableStock(currentBranchId).then(setAvailableStock);
    }
  }, [isOpen, currentBranchId, getAvailableStock]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        materials: [
          {
            ...initialData,
            costPerUnit: initialData.costPerUnit || undefined,
          },
        ],
      });
    }
  }, [initialData, form]);

  const handleStockSelect = (
    index: number,
    stockItem: WeldingMaterialStock
  ) => {
    update(index, {
      ...form.getValues(`materials.${index}`),
      name: stockItem.name,
      unit: stockItem.unit,
      stockItemId: stockItem.id,
      isCustom: false,
    });
    setPopoverOpen(null);
  };

  const handleSubmit = async (values: AddMaterialFormValues) => {
    if (!currentBranchId) return;
    setIsSubmitting(true);

    if (isEditMode && onUpdate && values.materials.length > 0) {
      await onUpdate(initialData.id, values.materials[0]);
    } else {
      for (const material of values.materials) {
        await addMaterialToJob(jobId, {
          ...material,
          branchId: currentBranchId,
          weldingJobId: jobId,
        });
      }
    }

    setIsSubmitting(false);
    setIsOpen(false);
    form.reset({
      materials: [
        {
          isCustom: false,
          name: "",
          quantity: 0,
          unit: "",
          costPerUnit: undefined,
          stockItemId: undefined,
        },
      ],
    });
  };

  const addNewMaterial = () => {
    append({
      isCustom: false,
      name: "",
      quantity: 0,
      unit: "",
      costPerUnit: undefined,
      stockItemId: undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Material" : "Add Materials to Job"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-96">
              <div className="space-y-6 p-1">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg relative"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">
                        Material #{index + 1}
                      </h3>
                      {!isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <Tabs
                      value={
                        form.watch(`materials.${index}.isCustom`)
                          ? "custom"
                          : "stock"
                      }
                      onValueChange={(value) => {
                        update(index, {
                          ...form.getValues(`materials.${index}`),
                          isCustom: value === "custom",
                          name: "",
                          unit: "",
                          stockItemId: undefined,
                        });
                      }}
                      className={isEditMode ? "hidden" : ""}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stock">From Stock</TabsTrigger>
                        <TabsTrigger value="custom">
                          Custom Material
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    {form.watch(`materials.${index}.isCustom`) ? (
                      <div className="space-y-4 py-4">
                        <FormField
                          control={form.control}
                          name={`materials.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Material Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Special Screw"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`materials.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`materials.${index}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., pieces"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`materials.${index}.costPerUnit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Cost per Unit (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <FormField
                          control={form.control}
                          name={`materials.${index}.stockItemId`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Select Material</FormLabel>
                              <Popover
                                open={popoverOpen === index}
                                onOpenChange={(isOpen) =>
                                  setPopoverOpen(isOpen ? index : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value
                                        ? availableStock.find(
                                            (item) => item.id === field.value
                                          )?.name || "Select material"
                                        : "Select material"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[475px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search material..." />
                                    <CommandEmpty>
                                      No material found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {availableStock.map((item) => (
                                        <CommandItem
                                          value={item.name}
                                          key={item.id}
                                          onSelect={() =>
                                            handleStockSelect(index, item)
                                          }
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              item.id === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          <div className="flex justify-between w-full">
                                            <span>{item.name}</span>
                                            <span className="text-muted-foreground text-sm">
                                              {item.quantityInStock}{" "}
                                              {item.unit} in stock
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`materials.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity to Use</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewMaterial}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Material
              </Button>
            )}
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Adding..."
                  : isEditMode
                  ? "Save Changes"
                  : "Add Materials"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
