"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Search } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfimModal";
import { useBlog, BlogPostField } from "@/contexts/Blog.Context";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const PAGE_SIZE = 10;

export default function BlogPage() {
  const navigate = useNavigate();
  const { blogs, paginationBlog, getBlogs, deleteBlog, blogCategories, getBlogCategories } = useBlog();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchData = (p = page, s = search, cat = categoryFilter) => {
    getBlogs({ size: PAGE_SIZE, page: p, search: s, ...(cat ? { category_blog_id: cat } : {}) } as any);
  };

  useEffect(() => {
    fetchData();
    getBlogCategories({ size: 100, page: 1, search: "" });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    getBlogs({ size: PAGE_SIZE, page: 1, search: e.target.value, ...(categoryFilter ? { category_blog_id: categoryFilter } : {}) } as any);
  };

  const handleCategoryFilter = (val: string) => {
    const cat = val === "all" ? "" : val;
    setCategoryFilter(cat);
    setPage(1);
    getBlogs({ size: PAGE_SIZE, page: 1, search, ...(cat ? { category_blog_id: cat } : {}) } as any);
  };

  const handleDelete = async (item: BlogPostField) => {
    const res = await deleteBlog(item.id);
    if (res?.status) {
      toast({ title: "Berhasil", description: "Artikel berhasil dihapus" });
      fetchData();
    } else {
      const msg = Array.isArray(res?.messages)
        ? res.messages.map((m: any) => m.message).join(", ")
        : res?.messages || "Gagal menghapus artikel";
      toast({ title: "Gagal", description: msg, variant: "destructive" });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage, search, categoryFilter);
  };

  const totalPage = paginationBlog?.total_page ?? 1;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: localeId });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artikel Blog</h1>
          <p className="text-muted-foreground">Kelola artikel dan konten marketing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/blog/category")}>
            Kelola Kategori
          </Button>
          <Button onClick={() => navigate("/blog/create")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Artikel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
                value={search}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter || "all"} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {blogCategories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Belum ada artikel
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </TableCell>
                    <TableCell>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-10 object-cover rounded-md border border-border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.excerpt}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category_blog_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.author_avatar && (
                          <img
                            src={item.author_avatar}
                            alt={item.author_name}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        <span className="text-sm">{item.author_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.featured ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Featured</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(item.published_date)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate("/blog/edit", { state: item.id })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <ConfirmModal
                          title="Hapus Artikel"
                          description={`Apakah kamu yakin ingin menghapus artikel <b>${item.title}</b>? Tindakan ini tidak bisa dibatalkan.`}
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
                          onConfirm={() => handleDelete(item)}
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

      {/* Pagination */}
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
    </div>
  );
}
