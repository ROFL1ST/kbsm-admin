import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Stok rendah: Laptop Dell XPS 13',
      message: 'Stok untuk produk Laptop Dell XPS 13 tersisa 3 unit. Segera lakukan restocking.',
      type: 'warning',
      time: '5 menit yang lalu',
      read: false,
      category: 'stock'
    },
    {
      id: 2,
      title: 'Pemesanan baru diterima',
      message: 'Pemesanan #INV-001 dari PT. Maju Jaya telah diterima dan menunggu konfirmasi.',
      type: 'info',
      time: '1 jam yang lalu',
      read: false,
      category: 'order'
    },
    {
      id: 3,
      title: 'Laporan bulanan tersedia',
      message: 'Laporan keuangan bulan Desember 2023 telah siap untuk didownload.',
      type: 'success',
      time: '2 jam yang lalu',
      read: true,
      category: 'report'
    },
    {
      id: 4,
      title: 'Pembayaran diterima',
      message: 'Pembayaran sebesar Rp 75.000.000 dari CV. Teknologi Baru telah dikonfirmasi.',
      type: 'success',
      time: '3 jam yang lalu',
      read: true,
      category: 'payment'
    },
    {
      id: 5,
      title: 'Backup data berhasil',
      message: 'Backup otomatis data sistem telah berhasil dilakukan pada 15 Jan 2024 02:00.',
      type: 'info',
      time: '5 jam yang lalu',
      read: true,
      category: 'system'
    },
    {
      id: 6,
      title: 'User baru mendaftar',
      message: 'User baru dengan email john.doe@company.com telah mendaftar dan menunggu approval.',
      type: 'info',
      time: '1 hari yang lalu',
      read: false,
      category: 'user'
    },
    {
      id: 7,
      title: 'Gagal mengirim email',
      message: 'Pengiriman email notifikasi ke beberapa user gagal. Silakan periksa konfigurasi SMTP.',
      type: 'error',
      time: '2 hari yang lalu',
      read: true,
      category: 'system'
    },
  ];

  const getTypeBadge = (type: string) => {
    const variants = {
      info: 'secondary',
      success: 'default',
      warning: 'outline',
      error: 'destructive'
    };
    const labels = {
      info: 'Info',
      success: 'Success',
      warning: 'Warning',
      error: 'Error'
    };
    return (
      <Badge variant={variants[type as keyof typeof variants] as any}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      stock: 'outline',
      order: 'secondary',
      report: 'secondary',
      payment: 'default',
      system: 'outline',
      user: 'secondary'
    };
    const labels = {
      stock: 'Stok',
      order: 'Pesanan',
      report: 'Laporan',
      payment: 'Pembayaran',
      system: 'Sistem',
      user: 'User'
    };
    return (
      <Badge variant={variants[category as keyof typeof variants] as any} className="text-xs">
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifikasi</h1>
          <p className="text-muted-foreground">
            Kelola semua notifikasi sistem dan aktivitas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Tandai Semua Dibaca
          </Button>
          <Button variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Semua
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Notifikasi</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-medium">Belum Dibaca</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Hari Ini</p>
              <p className="text-2xl font-bold">
                {notifications.filter(n => n.time.includes('menit') || n.time.includes('jam')).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Minggu Ini</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari notifikasi..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {!notification.read && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium truncate ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          {getTypeBadge(notification.type)}
                          {getCategoryBadge(notification.category)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada notifikasi ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}