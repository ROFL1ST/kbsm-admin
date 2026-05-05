"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { Save, X, ImagePlus, Tag } from "lucide-react";
import { useBlog } from "@/contexts/Blog.Context";
import { format } from "date-fns";

export default function EditBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const blogId = location.state as number;
  const { updateBlog, blogs, getBlogs, blogCategories, getBlogCategories } = useBlog();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category_blog_id: null as number | null,
    author_name: "",
    author_bio: "",
    published_date: "",
    tags: [] as string[],
    featured: false,
  });

  // Existing URLs
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null);

  // New files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // Tag input
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    getBlogCategories({ size: 100, page: 1, search: "" });
    if (!blogs.length) {
      getBlogs({ size: 100, page: 1, search: "" });
    }
  }, []);

  useEffect(() => {
    const post = blogs.find((b) => b.id === blogId);
    if (!post) return;
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category_blog_id: post.category_blog_id,
      author_name: post.author_name,
      author_bio: post.author_bio,
      published_date: post.published_date
        ? format(new Date(post.published_date), "yyyy-MM-dd")
        : "",
      tags: post.tags ?? [],
      featured: post.featured,
    });
    setExistingImage(post.image ?? null);
    setExistingAvatar(post.author_avatar ?? null);
  }, [blogs, blogId]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (imageRef.current) imageRef.current.value = "";
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    if (avatarRef.current) avatarRef.current.value = "";
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    handleChange("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    handleChange("tags", form.tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Gagal", description: "Judul artikel harus diisi", variant: "destructive" }); return;
    }
    if (!form.content.trim()) {
      toast({ title: "Gagal", description: "Konten artikel harus diisi", variant: "destructive" }); return;
    }
    if (!form.category_blog_id) {
      toast({ title: "Gagal", description: "Kategori harus dipilih", variant: "destructive" }); return;
    }
    if (!form.author_name.trim()) {
      toast({ title: "Gagal", description: "Nama penulis harus diisi", variant: "destructive" }); return;
    }
    if (!form.published_date) {
      toast({ title: "Gagal", description: "Tanggal publikasi harus diisi", variant: "destructive" }); return;
    }

    setIsLoading(true);
    try {
      const res = await updateBlog({
        ...form,
        blog_id: blogId,
        category_blog_id: form.category_blog_id!,
        image: imageFile ?? undefined,
        author_avatar: avatarFile ?? undefined,
      });
      if (res?.status) {
        toast({ title: "Berhasil", description: "Artikel berhasil diperbarui" });
        navigate("/blog");
      } else {
        const msg = Array.isArray(res?.messages)
          ? res.messages.map((m: any) => m.message).join(", ")
          : res?.messages || "Gagal memperbarui artikel";
        toast({ title: "Gagal", description: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const displayImage = imagePreview ?? existingImage;
  const displayAvatar = avatarPreview ?? existingAvatar;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Artikel</h1>
          <p className="text-muted-foreground">Perbarui artikel blog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/blog")} disabled={isLoading}>
            <X className="h-4 w-4 mr-1" /> Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            <Save className="h-4 w-4 mr-1" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left — main form */}
        <div className="md:col-span-2 space-y-5">
          <Card>
            <CardHeader><CardTitle>Informasi Artikel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Judul <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Masukkan judul artikel"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ringkasan (Excerpt)</Label>
                <Textarea
                  placeholder="Tulis ringkasan singkat artikel..."
                  value={form.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Konten <span className="text-red-500">*</span></Label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => handleChange("content", html)}
                  placeholder="Tulis konten artikel di sini..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-4 w-4" />Tags</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ketik tag lalu tekan Enter atau Tambah"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>Tambah</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-5">
          {/* Thumbnail */}
          <Card>
            <CardHeader><CardTitle>Thumbnail Artikel</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {displayImage ? (
                <div className="relative">
                  <img src={displayImage} alt="thumbnail" className="w-full h-40 object-cover rounded-lg border" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (!imageFile) setExistingImage(null);
                    }}
                    className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-primary/5 transition"
                  onClick={() => imageRef.current?.click()}
                >
                  <ImagePlus className="h-7 w-7 text-primary/50" />
                  <p className="text-sm text-muted-foreground text-center">Klik untuk upload thumbnail</p>
                </div>
              )}
              {displayImage && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => imageRef.current?.click()}>
                  Ganti Thumbnail
                </Button>
              )}
              <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </CardContent>
          </Card>

          {/* Publish settings */}
          <Card>
            <CardHeader><CardTitle>Pengaturan Publikasi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori <span className="text-red-500">*</span></Label>
                <Select
                  value={form.category_blog_id?.toString() || ""}
                  onValueChange={(v) => handleChange("category_blog_id", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogCategories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal Publikasi <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.published_date}
                  onChange={(e) => handleChange("published_date", e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-muted-foreground">Tampilkan sebagai artikel unggulan</p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => handleChange("featured", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader><CardTitle>Info Penulis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {displayAvatar ? (
                  <div className="relative">
                    <img src={displayAvatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                    <button
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        if (!avatarFile) setExistingAvatar(null);
                      }}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition"
                    onClick={() => avatarRef.current?.click()}
                  >
                    <ImagePlus className="h-5 w-5 text-primary/40" />
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => avatarRef.current?.click()}>
                  {displayAvatar ? "Ganti Foto" : "Upload Foto"}
                </Button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="space-y-2">
                <Label>Nama Penulis <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Nama penulis"
                  value={form.author_name}
                  onChange={(e) => handleChange("author_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bio Penulis</Label>
                <Textarea
                  placeholder="Deskripsi singkat penulis..."
                  value={form.author_bio}
                  onChange={(e) => handleChange("author_bio", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
