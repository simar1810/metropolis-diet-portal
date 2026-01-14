"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Check, X, FolderOpen } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks"
import { sendData } from "@/lib/api"
import { toast } from "sonner"
import { mutate } from "swr"
import DualOptionActionModal from "@/components/modals/DualOptionActionModal"
import { AlertDialogTrigger } from "@/components/ui/alert-dialog"
import AddCategoryModal from "@/components/modals/client/AddCategoryModal"
import { updateCoachField } from "@/providers/global/slices/coach"

export default function CategoriesPage() {
  const categories = useAppSelector(state => state.coach.data.client_categories)
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")

  const dispatch = useAppDispatch()

  const handleEditStart = (category) => {
    setEditingId(category._id)
    setEditValue(category.name)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  async function handleEditSave() {
    try {
      setLoading(true);
      const response = await sendData("app/categories", {
        updateCategory: [{
          key: editingId,
          value: editValue
        }]
      });
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("coachProfile");
      dispatch(updateCoachField({ "client_categories": response.data }))
      setEditingId(null)
      setEditValue("")
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(setLoading, closeBtnRef, categoryId) {
    try {
      setLoading(true);
      const response = await sendData("app/categories", { deleteKey: [categoryId] });
      if (response.status_code !== 200) throw new Error(response.message);
      mutate("coachProfile");
      dispatch(updateCoachField({ "client_categories": response.data }))
      toast.success(response.message);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground">Manage your content categories</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </Badge>

            <AddCategoryModal>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="h-4 w-4" />
                Add New Category
              </Button>
            </AddCategoryModal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="h-[200px] group hover:shadow-lg gap-0 transition-all duration-200 hover:-translate-y-1 border-0 shadow-md white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-primary/70" />
                  </div>
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStart(category)}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <DualOptionActionModal
                      description="Are you sure. You want to delete the category?"
                      action={(setLoading, closeBtnRef) => handleDelete(setLoading, closeBtnRef, category._id)}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                    </DualOptionActionModal>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 gap-0">
                {editingId === category._id ? (
                  <div className="space-y-3">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm"
                      placeholder="Category name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleEditSave} className="flex-1 h-8 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditCancel}
                        className="flex-1 h-8 text-xs bg-transparent"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">{category.name}</h3>
                  </div>
                )}
              </CardContent>

              {editingId !== category._id && (
                <CardFooter className="pt-0">
                  <div className="w-full h-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full" />
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first category</p>
            <AddCategoryModal>
              <Button variant="wz" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="h-4 w-4" />
                Create Your First Category
              </Button>
            </AddCategoryModal>
          </div>
        )}
      </div>
    </div>
  )
}
