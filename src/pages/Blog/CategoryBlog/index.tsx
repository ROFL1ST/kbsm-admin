"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Search } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useBlog, BlogCategoryField } from "@/contexts/Blog.Context";

const PAGE_SIZE = 10;

export default function BlogCategoryPage() {
  const { blogCategories, paginationCategory, getBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory } = useBlog();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<BlogCategoryField | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const fetchData = (p = page, s = search) => {
    getBlogCategories({ size: PAGE_SIZE, page: p, search: s });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    getBlogCategories({ size: PAGE_SIZE, page: 1, search: e.target.value });
  };

  const openCreate = () => {
    setEditTarget(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const openEdit = (item: BlogCategoryField) => {
    setEditTarget(item);
    setCategoryName(item.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast({ title: "Gagal", description: "Nama kategori tidak boleh kosong", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = editTarget
        ? await updateBlogCategory({ category_blog_id: editTarget.id, name: categoryName.trim() })
        : await createBlogCategory({ name: categoryName.trim() });

      if (res?.status) {
        toast({ title: "Berhasil", description: editTarget ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan" });
        setIsModalOpen(false);
        fetchData(page, search);
      } else {
        const msg = Array.isArray(res?.messages)
          ? res.messages.map((m: any) => m.message).join(", ")
          : res?.messages || "Gagal menyimpan kategori";
        toast({ title: "Gagal", description: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteBlogCategory(id);
    if (res?.status) {
      toast({ title: "Berhasil", description: "Kategori berhasil dihapus" });
      fetchData(page, search);
    } else {
      const msg = Array.isArray(res?.messages)
        ? res.messages.map((m: any) => m.message).join(", ")
        : res?.messages || "Gagal menghapus kategori";
      toast({ title: "Gagal", description: msg, variant: "destructive" });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage, search);
  };

  const totalPage = paginationCategory?.total_page ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kategori Blog</h1>
          <p className="text-muted-foreground">Kelola kategori artikel blog</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kategori..."
                value={search}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead className="text-center">Jumlah Artikel</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Belum ada kategori
                  </TableCell>
                </TableRow>
              ) : (
                blogCategories.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5">
                        {item.exx}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <ConfirmModal
                          title="Hapus Kategori"
                          description={`Apakah kamu yakin ingin menghapus kategori <b>${item.name}</b>? Tindakan ini tidak bisa dibatalkan.`}
                          confirmText="Hapus"
                          cancelText="Batal"
                          variant="destructive"
                          showIcon={false}
                          useHTML
                          trigger={
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                            </Button>
                          }
                          onConfirm={() => handleDelete(item.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPage > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} / {totalPage}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPage} onClick={() => handlePageChange(page + 1)}>
            Berikutnya
          </Button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="cat-name">Nama Kategori <span className="text-red-500">*</span></Label>
            <Input
              id="cat-name"
              placeholder="Contoh: Skincare Tips"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
