import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  Trash,
  RotateCcw,
  Sparkles,
  CalendarIcon,
  Loader2,
  Save,
  PlusCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Item {
  id: string;
  title: string;
  completed: boolean;
}

interface SelectableItem extends Item {
  selected: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  items: Item[];
  expanded?: boolean;
}

const formSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dueDate: z.date(),
  items: z.array(
    z.object({
      id: z.string(),
      completed: z.boolean().default(false),
      title: z.string(),
    })
  ),
});

interface EditTaskFormProps {
  task: Task;
  isDeleting: boolean;
  isModifying: boolean;
  onSubmit: (task: Task) => Promise<void>;
  onDelete: (taskId: string) => void;
  onRestore: () => void;
}

export function EditTaskForm({
  task,
  isDeleting,
  isModifying,
  onSubmit,
  onDelete,
  onRestore,
}: EditTaskFormProps) {
  const [newItemText, setNewItemText] = useState("");
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<SelectableItem[]>([]);
  const [isGeneratingItems, setIsGeneratingItems] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate),
      items: task.items.map((item) => ({
        id: item.id,
        title: item.title,
        completed: item.completed,
      })),
    },
  });

  // Cada vez que cambia editingTask (la tarea en edición),
  // se cambian los valores por defecto del formulario
  useEffect(() => {
    if (task) {
      form.reset({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate),
        items: task.items.map((item) => ({
          id: item.id,
          title: item.title,
          completed: item.completed,
        })),
      });
    }
  }, [task]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedCount = generatedItems.filter((item) => item.selected).length;

  const generateItemsWithAI = async (task: Task) => {
    setIsGeneratingItems(true);

    try {
      const response = await fetch("/api/generate-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data: {
        status: "success" | "error";
        message: string;
        data?: Item[];
      } = await response.json();
      if (data.status === "error") {
        throw new Error(data.message);
      }
      const { data: items } = data;
      if (items && items.length > 0) {
        setGeneratedItems(items.map((item) => ({ ...item, selected: true })));
        setShowAIOptions(true);
      }
    } catch (error) {
      toast.error("Generate Items", {
        description: "Failed to generate items.",
      });
    } finally {
      setIsGeneratingItems(false);
    }
  };

  const toggleGeneratedItem = (id: string) => {
    setGeneratedItems(
      generatedItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleAddSelectedItems = () => {
    const selectedItems = generatedItems
      .filter((item) => item.selected)
      .map(({ id, title, completed }) => ({ id, title, completed }));
    if (selectedItems.length > 0) {
      append(selectedItems);
    }

    setGeneratedItems([]);
    setShowAIOptions(false);
  };

  const handleReplaceWithSelectedItems = () => {
    const selectedItems = generatedItems
      .filter((item) => item.selected)
      .map(({ id, title, completed }) => ({ id, title, completed }));

    if (selectedItems.length > 0) {
      remove(fields.map((_, index) => index));
      append(selectedItems);
    }

    setGeneratedItems([]);
    setShowAIOptions(false);
  };

  const handleCancelGeneration = () => {
    setGeneratedItems([]);
    setShowAIOptions(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            ...values,
            dueDate: format(values.dueDate, "yyyy-MM-dd"),
          })
        )}
        className="space-y-4 py-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What is your task titled?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What does your task consist of? (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <FormLabel className="">Items</FormLabel>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-primary"
              onClick={() => {
                const currentValues = form.getValues();
                return generateItemsWithAI({
                  ...currentValues,
                  dueDate: format(currentValues.dueDate, "yyyy-MM-dd"),
                });
              }}
              disabled={isGeneratingItems || showAIOptions}
            >
              {isGeneratingItems ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              <span>Generate with AI</span>
            </Button>
          </div>
          {/* Show AI options */}
          {showAIOptions && (
            <div className="mb-3 p-3 bg-primary-foreground rounded-md grid gap-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  AI generated items for your task
                </p>
              </div>

              <div className="grid gap-2 mb-2">
                {generatedItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors",
                      item.selected ? "bg-primary/5" : "hover:bg-gray-100"
                    )}
                  >
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleGeneratedItem(item.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <span className="text-sm flex-1">{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancelGeneration}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReplaceWithSelectedItems}
                    disabled={selectedCount === 0}
                  >
                    Replace All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddSelectedItems}
                    disabled={selectedCount === 0}
                  >
                    Add Selected ({selectedCount})
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.completed`}
                  render={({ field }) => (
                    <FormItem className="">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name={`items.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Investigar tendencias del mercado"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add new item"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItemText.trim() !== "") {
                    append({
                      id: new Date().toISOString(),
                      title: newItemText.trim(),
                      completed: false,
                    });
                    setNewItemText("");
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (newItemText.trim() !== "") {
                    append({
                      id: new Date().toISOString(),
                      title: newItemText.trim(),
                      completed: false,
                    });
                    setNewItemText("");
                  }
                }}
              >
                <PlusCircle />
                Add
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <Button
            type="button"
            disabled={isModifying || isDeleting}
            variant="destructive"
            onClick={() => onDelete && onDelete(task.id)}
            className="flex items-center"
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash />}
            Remove
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={isModifying || isDeleting}
              variant="outline"
              onClick={onRestore}
              className="flex items-center"
            >
              <RotateCcw />
              Restore
            </Button>
            <Button type="submit" disabled={isModifying || isDeleting}>
              {isModifying ? <Loader2 className="animate-spin" /> : <Save />}
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

interface CreateTaskFormProps {
  onSubmit: (task: Task) => Promise<void>;
  isCreating: boolean;
}

export function CreateTaskForm({ onSubmit, isCreating }: CreateTaskFormProps) {
  const [newItemText, setNewItemText] = useState("");
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<SelectableItem[]>([]);
  const [isGeneratingItems, setIsGeneratingItems] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: new Date().toISOString(),
      title: "",
      description: "",
      dueDate: new Date(),
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedCount = generatedItems.filter((item) => item.selected).length;

  const generateItemsWithAI = async (task: Task) => {
    setIsGeneratingItems(true);

    try {
      const response = await fetch("/api/generate-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data: {
        status: "success" | "error";
        message: string;
        data?: Item[];
      } = await response.json();
      if (data.status === "error") {
        throw new Error(data.message);
      }
      const { data: items } = data;
      if (items && items.length > 0) {
        setGeneratedItems(items.map((item) => ({ ...item, selected: true })));
        setShowAIOptions(true);
      }
    } catch (error) {
      toast.error("Generate Items", {
        description: "Failed to generate items.",
      });
    } finally {
      setIsGeneratingItems(false);
    }
  };

  const toggleGeneratedItem = (id: string) => {
    setGeneratedItems(
      generatedItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleAddSelectedItems = () => {
    const selectedItems = generatedItems
      .filter((item) => item.selected)
      .map(({ id, title, completed }) => ({ id, title, completed }));
    if (selectedItems.length > 0) {
      append(selectedItems);
    }

    setGeneratedItems([]);
    setShowAIOptions(false);
  };

  const handleReplaceWithSelectedItems = () => {
    const selectedItems = generatedItems
      .filter((item) => item.selected)
      .map(({ id, title, completed }) => ({ id, title, completed }));

    if (selectedItems.length > 0) {
      remove(fields.map((_, index) => index));
      append(selectedItems);
    }

    setGeneratedItems([]);
    setShowAIOptions(false);
  };

  const handleCancelGeneration = () => {
    setGeneratedItems([]);
    setShowAIOptions(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          onSubmit({ ...data, dueDate: format(data.dueDate, "yyyy-MM-dd") })
        )}
        className="space-y-4 py-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What is your task titled?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What does your task consist of? (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <FormLabel className="">Items</FormLabel>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-primary"
              onClick={() => {
                const currentValues = form.getValues();
                return generateItemsWithAI({
                  ...currentValues,
                  dueDate: format(currentValues.dueDate, "yyyy-MM-dd"),
                });
              }}
              disabled={isGeneratingItems || showAIOptions}
            >
              {isGeneratingItems ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              <span>Generate with AI</span>
            </Button>
          </div>
          {/* Show AI options */}
          {showAIOptions && (
            <div className="mb-3 p-3 bg-primary-foreground rounded-md grid gap-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  AI generated items for your task
                </p>
              </div>

              <div className="grid gap-2 mb-2">
                {generatedItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors",
                      item.selected ? "bg-primary/5" : "hover:bg-gray-100"
                    )}
                  >
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => toggleGeneratedItem(item.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <span className="text-sm flex-1">{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancelGeneration}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReplaceWithSelectedItems}
                    disabled={selectedCount === 0}
                  >
                    Replace All
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddSelectedItems}
                    disabled={selectedCount === 0}
                  >
                    Add Selected ({selectedCount})
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.completed`}
                  render={({ field }) => (
                    <FormItem className="">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name={`items.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Investigar tendencias del mercado"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                ></FormField>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash />
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add new item"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItemText.trim() !== "") {
                    append({
                      id: new Date().toISOString(),
                      title: newItemText.trim(),
                      completed: false,
                    });
                    setNewItemText("");
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (newItemText.trim() !== "") {
                    append({
                      id: new Date().toISOString(),
                      title: newItemText.trim(),
                      completed: false,
                    });
                    setNewItemText("");
                  }
                }}
              >
                <PlusCircle />
                Add
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center mt-6">
          <Button type="submit" disabled={isCreating}>
            {isCreating ? <Loader2 className="animate-spin" /> : <Save />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
