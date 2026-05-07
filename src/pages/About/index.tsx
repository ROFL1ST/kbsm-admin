import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import {
  AboutData,
  AboutStatItem,
  AboutValueItem,
  useAbout,
} from "@/contexts/About.Context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AboutPage() {
  const { aboutData, isLoading, getAbout, updateAbout } = useAbout();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<AboutData | null>(null);
  const [originalForm, setOriginalForm] = useState<AboutData | null>(null);

  useEffect(() => {
    getAbout();
  }, []);

  useEffect(() => {
    if (aboutData) {
      setForm(JSON.parse(JSON.stringify(aboutData)));
      setOriginalForm(JSON.parse(JSON.stringify(aboutData)));
    }
  }, [aboutData]);

  const handleEditToggle = () => {
    if (isEditMode) {
      setForm(JSON.parse(JSON.stringify(originalForm)));
      setIsEditMode(false);
    } else {
      setOriginalForm(JSON.parse(JSON.stringify(form)));
      setIsEditMode(true);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      const res = await updateAbout(form);
      if (res?.status) {
        toast({ title: "Berhasil", description: "Halaman About berhasil diperbarui" });
        setOriginalForm(JSON.parse(JSON.stringify(form)));
        setIsEditMode(false);
        getAbout();
      } else {
        toast({ title: "Gagal", description: res?.messages || "Gagal menyimpan", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan saat menyimpan", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const setHero = (key: string, val: string) =>
    setForm((prev) => prev && { ...prev, hero: { ...prev.hero, [key]: val } });

  const setHeroCta = (type: "cta_primary" | "cta_secondary", key: string, val: string) =>
    setForm((prev) =>
      prev && {
        ...prev,
        hero: { ...prev.hero, [type]: { ...prev.hero[type], [key]: val } },
      }
    );

  const setBrandStory = (key: string, val: string | string[]) =>
    setForm((prev) => prev && { ...prev, brand_story: { ...prev.brand_story, [key]: val } });

  const setStats = (key: string, val: string) =>
    setForm((prev) => prev && { ...prev, stats: { ...prev.stats, [key]: val } });

  const setStatItem = (idx: number, key: keyof AboutStatItem, val: string | number) =>
    setForm((prev) => {
      if (!prev) return prev;
      const items = [...prev.stats.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...prev, stats: { ...prev.stats, items } };
    });

  const addStatItem = () =>
    setForm((prev) =>
      prev
        ? { ...prev, stats: { ...prev.stats, items: [...prev.stats.items, { value: 0, suffix: "+", label: "" }] } }
        : prev
    );

  const removeStatItem = (idx: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, stats: { ...prev.stats, items: prev.stats.items.filter((_, i) => i !== idx) } }
        : prev
    );

  const setValues = (key: string, val: string) =>
    setForm((prev) => prev && { ...prev, values: { ...prev.values, [key]: val } });

  const setValueItem = (idx: number, key: keyof AboutValueItem, val: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const items = [...prev.values.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...prev, values: { ...prev.values, items } };
    });

  const addValueItem = () =>
    setForm((prev) =>
      prev
        ? { ...prev, values: { ...prev.values, items: [...prev.values.items, { icon: "", title: "", description_html: "" }] } }
        : prev
    );

  const removeValueItem = (idx: number) =>
    setForm((prev) =>
      prev
        ? { ...prev, values: { ...prev.values, items: prev.values.items.filter((_, i) => i !== idx) } }
        : prev
    );

  const setCta = (key: string, val: string) =>
    setForm((prev) =>
      prev ? { ...prev, cta: { ...(prev.cta ?? { title_html: "", subtitle_html: "", cta_primary: { label: "", href: "" }, cta_secondary: { label: "", href: "" } }), [key]: val } } : prev
    );

  const setCtaBtn = (type: "cta_primary" | "cta_secondary", key: string, val: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      const base = prev.cta ?? { title_html: "", subtitle_html: "", cta_primary: { label: "", href: "" }, cta_secondary: { label: "", href: "" } };
      return { ...prev, cta: { ...base, [type]: { ...base[type], [key]: val } } };
    });

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CMS Halaman About</h1>
          <p className="text-muted-foreground">Kelola konten halaman About, Brand Story, Stats, dan Values</p>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={isSaving} className="flex items-center gap-2">
                <X className="h-4 w-4" /> Batal
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Mode Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="brand_story">Brand Story</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
        </TabsList>

        {/* ── HERO ───────────────────────────────────────────────────────────────────────────── */}
        <TabsContent value="hero" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input value={form.hero.badge} disabled={!isEditMode} onChange={(e) => setHero("badge", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title (HTML)</Label>
                  <Input value={form.hero.title_html} disabled={!isEditMode} onChange={(e) => setHero("title_html", e.target.value)} placeholder="Gunakan tag HTML seperti <em>, <br />" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Subtitle</Label>
                  <RichTextEditor value={form.hero.subtitle_html} onChange={(v) => setHero("subtitle_html", v)} readOnly={!isEditMode} placeholder="Subtitle hero..." />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                  <CardHeader><CardTitle className="text-sm">CTA Primer</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input value={form.hero.cta_primary.label} disabled={!isEditMode} onChange={(e) => setHeroCta("cta_primary", "label", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Href</Label>
                      <Input value={form.hero.cta_primary.href} disabled={!isEditMode} onChange={(e) => setHeroCta("cta_primary", "href", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader><CardTitle className="text-sm">CTA Sekunder</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input value={form.hero.cta_secondary.label} disabled={!isEditMode} onChange={(e) => setHeroCta("cta_secondary", "label", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Href</Label>
                      <Input value={form.hero.cta_secondary.href} disabled={!isEditMode} onChange={(e) => setHeroCta("cta_secondary", "href", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BRAND STORY ────────────────────────────────────────────────────────────────── */}
        <TabsContent value="brand_story" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Brand Story Section</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input value={form.brand_story.badge} disabled={!isEditMode} onChange={(e) => setBrandStory("badge", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tahun Berdiri</Label>
                  <Input value={form.brand_story.established_year} disabled={!isEditMode} onChange={(e) => setBrandStory("established_year", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input value={form.brand_story.location} disabled={!isEditMode} onChange={(e) => setBrandStory("location", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title (HTML)</Label>
                  <Input value={form.brand_story.title_html} disabled={!isEditMode} onChange={(e) => setBrandStory("title_html", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Konten</Label>
                  <RichTextEditor value={form.brand_story.content_html} onChange={(v) => setBrandStory("content_html", v)} readOnly={!isEditMode} placeholder="Cerita brand..." />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {form.brand_story.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <Input
                        value={tag}
                        disabled={!isEditMode}
                        className="h-8 w-36 text-sm"
                        onChange={(e) => {
                          const tags = [...form.brand_story.tags];
                          tags[idx] = e.target.value;
                          setBrandStory("tags", tags);
                        }}
                      />
                      {isEditMode && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                          onClick={() => setBrandStory("tags", form.brand_story.tags.filter((_, i) => i !== idx))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditMode && (
                    <Button variant="outline" size="sm" className="h-8"
                      onClick={() => setBrandStory("tags", [...form.brand_story.tags, ""])}>
                      <Plus className="h-3 w-3 mr-1" /> Tambah Tag
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── STATS ────────────────────────────────────────────────────────────────────────── */}
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Stats Section</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input value={form.stats.badge} disabled={!isEditMode} onChange={(e) => setStats("badge", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title (HTML)</Label>
                  <Input value={form.stats.title_html} disabled={!isEditMode} onChange={(e) => setStats("title_html", e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Item Statistik</Label>
                {form.stats.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-end p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Nilai</Label>
                      <Input type="number" value={item.value} disabled={!isEditMode}
                        onChange={(e) => setStatItem(idx, "value", Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Suffix</Label>
                      <Input value={item.suffix} disabled={!isEditMode}
                        onChange={(e) => setStatItem(idx, "suffix", e.target.value)} />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Label</Label>
                      <div className="flex gap-2">
                        <Input value={item.label} disabled={!isEditMode}
                          onChange={(e) => setStatItem(idx, "label", e.target.value)} />
                        {isEditMode && (
                          <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeStatItem(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isEditMode && (
                  <Button variant="outline" size="sm" onClick={addStatItem}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah Stat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── VALUES ───────────────────────────────────────────────────────────────────────── */}
        <TabsContent value="values" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Values Section</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input value={form.values.badge} disabled={!isEditMode} onChange={(e) => setValues("badge", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title (HTML)</Label>
                  <Input value={form.values.title_html} disabled={!isEditMode} onChange={(e) => setValues("title_html", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Subtitle</Label>
                  <RichTextEditor value={form.values.subtitle_html} onChange={(v) => setValues("subtitle_html", v)} readOnly={!isEditMode} placeholder="Subtitle values..." />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Item Values</Label>
                {form.values.items.map((item, idx) => (
                  <Card key={idx} className="border-dashed">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Value #{idx + 1}</CardTitle>
                        {isEditMode && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeValueItem(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Icon (Lucide name)</Label>
                          <Input value={item.icon} disabled={!isEditMode} placeholder="e.g. Leaf, Heart, ShieldCheck" onChange={(e) => setValueItem(idx, "icon", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Judul</Label>
                          <Input value={item.title} disabled={!isEditMode} onChange={(e) => setValueItem(idx, "title", e.target.value)} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Deskripsi</Label>
                          <RichTextEditor value={item.description_html} onChange={(v) => setValueItem(idx, "description_html", v)} readOnly={!isEditMode} placeholder="Deskripsi value..." />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {isEditMode && (
                  <Button variant="outline" size="sm" onClick={addValueItem}>
                    <Plus className="h-4 w-4 mr-1" /> Tambah Value
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CTA ──────────────────────────────────────────────────────────────────────────── */}
        <TabsContent value="cta" className="mt-4">
          <Card>
            <CardHeader><CardTitle>CTA Section</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Title (HTML)</Label>
                <Input value={form.cta?.title_html ?? ""} disabled={!isEditMode} onChange={(e) => setCta("title_html", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <RichTextEditor value={form.cta?.subtitle_html ?? ""} onChange={(v) => setCta("subtitle_html", v)} readOnly={!isEditMode} placeholder="Subtitle CTA..." />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                  <CardHeader><CardTitle className="text-sm">CTA Primer</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input value={form.cta?.cta_primary?.label ?? ""} disabled={!isEditMode} onChange={(e) => setCtaBtn("cta_primary", "label", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Href</Label>
                      <Input value={form.cta?.cta_primary?.href ?? ""} disabled={!isEditMode} onChange={(e) => setCtaBtn("cta_primary", "href", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader><CardTitle className="text-sm">CTA Sekunder</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input value={form.cta?.cta_secondary?.label ?? ""} disabled={!isEditMode} onChange={(e) => setCtaBtn("cta_secondary", "label", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Href</Label>
                      <Input value={form.cta?.cta_secondary?.href ?? ""} disabled={!isEditMode} onChange={(e) => setCtaBtn("cta_secondary", "href", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
