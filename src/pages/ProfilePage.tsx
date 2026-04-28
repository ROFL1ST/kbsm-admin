import React, { useEffect } from "react";
import { Camera, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/Auth.Context";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface FormStateProfile {
  admin_id: string;
  firstname: string;
  lastname: string;
  password: string | null;
  email: string;
  phone: string;
  responsibilities_code: string[];
  path: string | null;
}

export default function ProfilePage() {
  const {
    user,
    recoveryPassword,
    responsibleList,
    responsibles,
    updateUser,
    checkAuth,
  } = useAuth();
  const [originalUserForm, setOriginalUserForm] =
    React.useState<FormStateProfile | null>(null);
  const [profileForm, setProfileForm] = React.useState<FormStateProfile>({
    admin_id: "",
    firstname: "",
    lastname: "",
    password: null,
    email: "",
    phone: "",
    responsibilities_code: [],
    path: null,
  });
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [recoveForm, setRecovForm] = React.useState({
    password: "",
    conf_pass: "",
  });
  const [loadProfile, setLoadProfile] = React.useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
      // timeZone: "UTC",
    });
  };

  const handlePasswordUpdate = async () => {
    try {
      const res = await recoveryPassword({
        password: recoveForm.password,
        conf_pass: recoveForm.conf_pass,
      });

      if (recoveForm.password !== recoveForm.conf_pass) {
        toast({
          title: "Gagal memperbarui password",
          description: "Password dan konfirmasi password tidak sesuai.",
          variant: "destructive",
        });
        return;
      } else {
        if (res.status) {
          toast({
            title: "Password berhasil diperbarui",
            description: "Password Anda telah diperbarui.",
          });
          setRecovForm({
            password: "",
            conf_pass: "",
          });
        } else {
          toast({
            title: "Gagal memperbarui password",
            description:
              res.messages || "Terjadi kesalahan saat memperbarui password.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.log("Error updating password: ", error);
      toast({
        title: "Gagal memperbarui password",
        description: "Terjadi kesalahan saat memperbarui password.",
        variant: "destructive",
      });
    }
  };

  const handleSelectResponsible = (code: string) => {
    setProfileForm((prevForm) => {
      const isSelected = prevForm.responsibilities_code.includes(code);
      let updatedResponsibilities: string[];
      if (isSelected) {
        updatedResponsibilities = prevForm.responsibilities_code.filter(
          (resp) => resp !== code
        );
      } else {
        updatedResponsibilities = [...prevForm.responsibilities_code, code];
      }
      return {
        ...prevForm,
        responsibilities_code: updatedResponsibilities,
      };
    });
  };

  const handleUpdateProfile = async () => {
    try {
      setLoadProfile(true);
      const { firstname, lastname, password, ...profileData } = profileForm;
      const formData = {
        ...profileData,
        name: `${profileForm.firstname} ${profileForm.lastname}`,
        password: null,
      };

      const res = await updateUser(formData);
      if (res.status) {
        toast({
          title: "Profil berhasil diperbarui",
          description: "Informasi profil Anda telah diperbarui.",
        });
        setOriginalUserForm(profileForm);
        checkAuth();
      } else {
        toast({
          title: "Gagal memperbarui profil",
          description:
            res.messages || "Terjadi kesalahan saat memperbarui profil.",
          variant: "destructive",
        });
      }
      setLoadProfile(false);
    } catch (error) {
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan saat memperbarui profil.",
        variant: "destructive",
      });
      console.log("Error updating profile: ", error);
      setLoadProfile(false);
    }
  };

  const convertToSquare = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const size = Math.min(img.width, img.height);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas not supported");

          canvas.width = size;
          canvas.height = size;

          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;

          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 🔹 Handle file upload
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      console.log("Before resize:", (file.size / 1024).toFixed(2), "KB");

      const squareImage = await convertToSquare(file);

      const base64Length = squareImage.length - (squareImage.indexOf(",") + 1);
      const afterSizeKB = (base64Length * 3) / 4 / 1024;
      console.log("After resize:", afterSizeKB.toFixed(2), "KB");

      setProfileImage(squareImage);
      setProfileForm((prev) => ({ ...prev, path: squareImage }));
    } catch (error) {
      console.error("Error converting image:", error);
    }
  };

  useEffect(() => {
    if (user) {
      const newForm: FormStateProfile = {
        admin_id: user.id,
        firstname: user.name.split(" ")[0] || "",
        lastname: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
        password: null,
        phone: user.phone,
        responsibilities_code: user.responsibilities
          ? user.responsibilities.map((r) => r.code)
          : [],
        path: user.path || null,
      };
      if (user.path) setProfileImage(user.path);

      setProfileForm(newForm);
      setOriginalUserForm(newForm);
    }
  }, [user]);

  useEffect(() => {
    responsibleList();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profil</h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dan pengaturan akun
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() =>
                    document.getElementById("profileUpload")?.click()
                  }
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {user?.responsibilities.map((i) => i.name).join(" | ")}
                </Badge>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Bergabung {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nama Depan</Label>
                <Input
                  id="firstName"
                  placeholder="Masukkan nama depan"
                  onChange={(e) => {
                    setProfileForm((prev) => ({
                      ...prev,
                      firstname: e.target.value,
                    }));
                  }}
                  defaultValue={profileForm.firstname}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nama Belakang</Label>
                <Input
                  id="lastName"
                  placeholder="Masukkan nama belakang"
                  onChange={(e) => {
                    setProfileForm((prev) => ({
                      ...prev,
                      lastname: e.target.value,
                    }));
                  }}
                  defaultValue={profileForm.lastname}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                onChange={(e) => {
                  setProfileForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                }}
                defaultValue={profileForm.email}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  placeholder="Masukkan nomor telepon"
                  defaultValue={profileForm.phone}
                  onChange={(e) => {
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex-1 space-y-2">
                  <Label className="">Responsibilitas</Label>
                  <div className=" grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                    {responsibles &&
                      responsibles.map((resp) => (
                        <div key={resp.code} className="flex items-center">
                          <Checkbox
                            disabled
                            checked={profileForm.responsibilities_code.includes(
                              resp.code
                            )}
                            onCheckedChange={() =>
                              handleSelectResponsible(resp.code)
                            }
                          />
                          <span className="ml-2">{resp.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                placeholder="Masukkan alamat lengkap"
                defaultValue="Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Ceritakan sedikit tentang diri Anda"
                defaultValue="Supply Chain Manager dengan pengalaman 5+ tahun dalam industri teknologi."
              />
            </div> */}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (originalUserForm) {
                    setProfileForm(originalUserForm);
                  }
                }}
              >
                Batal
              </Button>
              <Button
                disabled={
                  JSON.stringify(profileForm) ===
                    JSON.stringify(originalUserForm) || loadProfile
                }
                onClick={() => {
                  handleUpdateProfile();
                }}
              >
                {loadProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Keamanan & Privasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Masukkan password saat ini"
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={recoveForm.password}
                onChange={(e) => {
                  setRecovForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                }}
                placeholder="Masukkan password baru"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={recoveForm.conf_pass}
                onChange={(e) => {
                  setRecovForm((prev) => ({
                    ...prev,
                    conf_pass: e.target.value,
                  }));
                }}
                placeholder="Konfirmasi password baru"
                autoComplete="new-password"
                // className="md:w-1/2"
              />
            </div>
          </div>

          <Button
            disabled={recoveForm.password == "" || recoveForm.conf_pass == ""}
            onClick={handlePasswordUpdate}
            className={`${
              recoveForm.password == "" || recoveForm.conf_pass == ""
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Activity Log */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Login to dashboard",
                time: "2 menit yang lalu",
                ip: "192.168.1.1",
              },
              {
                action: "Updated stock for Laptop Dell",
                time: "1 jam yang lalu",
                ip: "192.168.1.1",
              },
              {
                action: "Generated financial report",
                time: "2 jam yang lalu",
                ip: "192.168.1.1",
              },
              {
                action: "Added new incoming item",
                time: "4 jam yang lalu",
                ip: "192.168.1.1",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  IP: {activity.ip}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
