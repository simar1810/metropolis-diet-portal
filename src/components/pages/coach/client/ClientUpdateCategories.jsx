import FormControl from "@/components/FormControl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { sendData } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";
import { Pen } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function ClientUpdateCategories({
  clientData,
  open,
  onClose,
  children
}) {
  const { client_categories = [] } = useAppSelector(state => state.coach.data);

  const { categories: clientCategories } = clientData;
  const set = new Set(clientCategories)

  const categories = useMemo(() => {
    const map = new Map();
    for (const category of client_categories) {
      map.set(category._id, category.name)
    }
    return map;
  });

  const notSelectedCategories = Array.from(categories)
    .filter(([categoryId]) => !set.has(categoryId));
  const selectedCategories = Array.from(categories)
    .filter(([categoryId]) => set.has(categoryId))

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientIds: [clientData._id],
    categoryIds: selectedCategories.map(category => category[0]),
    removeCategoryIds: []
  });

  async function udpateCategories() {
    try {
      setLoading(true);
      const response = await sendData("app/categories/client", formData);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      location.reload()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function selectClientId(id) {
    setFormData(prev => !formData.categoryIds.includes(id)
      ? ({
        ...prev,
        categoryIds: [...prev.categoryIds, id],
        removeCategoryIds: prev.removeCategoryIds.filter(item => item !== id)
      })
      : {
        ...prev,
        categoryIds: prev.categoryIds.filter(item => item !== id),
        removeCategoryIds: [...prev.removeCategoryIds, id]
      })
  }

  return <Dialog defaultOpen={open} onOpenChange={onClose}>
    {children}
    {!children && <DialogTrigger>
      <Pen className="w-[16px] h-[16px]" />
    </DialogTrigger>}
    <DialogContent className="gap-0 p-0">
      <DialogTitle className="p-4 border-b-1">Categories</DialogTitle>
      <div className="p-4">
        {selectedCategories.length > 0 && <>
          {selectedCategories.map(([categoryId, categoryName]) => <label
            key={categoryId}
            className="mb-2 flex items-center gap-4 cursor-pointer"
          >
            <p>{categoryName}</p>
            <FormControl
              className="ml-auto"
              type="checkbox"
              checked={formData.categoryIds.includes(categoryId)}
              onChange={() => selectClientId(categoryId)}
            />
          </label>)}
        </>}
        {notSelectedCategories.length > 0 && <>
          {notSelectedCategories.map(([categoryId, categoryName]) => <label
            key={categoryId}
            className="mb-2 flex items-center gap-4 cursor-pointer"
          >
            <p>{categoryName}</p>
            <FormControl
              className="ml-auto"
              type="checkbox"
              checked={formData.categoryIds.includes(categoryId)}
              onChange={() => selectClientId(categoryId)}
            />
          </label>)}
        </>}
        {/* {formData.categoryIds.length + formData.removeCategoryIds.length > 0 &&  */}
        <Button
          variant="wz"
          className="mt-4 block mx-auto"
          disabled={loading}
          onClick={udpateCategories}
        >
          Save
        </Button>
        {/* } */}
      </div>
    </DialogContent>
  </Dialog>
}