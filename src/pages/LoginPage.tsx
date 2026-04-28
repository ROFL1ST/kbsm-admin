import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Package,
  TrendingUp,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/Auth.Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import ksmLogo from "../assets/ksm_1.png";
const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  remember: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const loggedInUser = await login(
        data.email,
        data.password,
        data.remember
      );
      if (loggedInUser) {
        toast({
          title: "Login berhasil!",
          description: "Selamat datang di Supply-Demand Dashboard",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login gagal",
          description: "Email atau password salah.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login gagal",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Analisis Real-time",
      description: "Pantau rantai pasokan secara langsung",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Dashboard Cerdas",
      description: "Visualisasi data interaktif",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Kolaborasi Tim",
      description: "Manajemen tim yang terintegrasi",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Keamanan Enterprise",
      description: "Enkripsi tingkat tinggi",
    },
  ];

  const handleMafiinCloudClick = () => {
    window.open("https://mafiincloud.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-primary/2 flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Animated Orbs */}
      <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-primary/40 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-primary/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse delay-500"></div>

      {/* Main Content */}
      <div className="flex-1 flex z-10">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            {/* Header dengan Logo MafiinCloud */}
            <div className="text-center lg:text-left mb-8 lg:mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-2xl"></div>
                    <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-2xl shadow-2xl shadow-primary/25">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="">
                    <img
                      src={ksmLogo}
                      alt="MafiinCloud"
                      className="w-32 mr-36 object-contain"
                    />
                  </div>
                </div>

                {/* Logo MafiinCloud dengan Gambar */}
                <div
                  className="cursor-pointer group relative"
                  onClick={handleMafiinCloudClick}
                  title="Kunjungi MafiinCloud.com"
                >
                  <div className="absolute inset-0 bg-primary/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-background to-muted border border-primary/20 rounded-xl p-3 group-hover:border-primary/40 transition-all duration-300 shadow-lg group-hover:shadow-primary/10">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src="https://www.mafiincloud.com/images/logo/MB.png"
                          alt="MafiinCloud"
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            // Fallback jika gambar gagal load
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.innerHTML =
                              '<span class="text-primary font-bold text-sm">MC</span>';
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">
                          MafiinCloud
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Powered by
                        </p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                Kelola
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                  Semua Mudah
                </span>
              </h2>
              <p className="text-muted-foreground text-lg lg:text-xl mt-4 max-w-md">
                Platform manajemen supply-demand terintegrasi untuk bisnis
                modern
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-0 bg-background/50 backdrop-blur-xl shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden border border-primary/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/70"></div>
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-2xl font-bold text-foreground text-center">
                  Selamat Datang Kembali
                </CardTitle>
                <CardDescription className="text-muted-foreground text-center">
                  Masuk ke akun Anda untuk melanjutkan
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Alamat Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@supplydashboard.com"
                        {...register("email")}
                        className="h-12 bg-background/50 border-primary/10 text-foreground placeholder:text-muted-foreground focus:bg-background focus:border-primary transition-all duration-200 rounded-xl"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <span>⚠</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password Anda"
                        {...register("password")}
                        className="h-12 pr-12 bg-background/50 border-primary/10 text-foreground placeholder:text-muted-foreground focus:bg-background focus:border-primary transition-all duration-200 rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <span>⚠</span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={watch("remember")}
                        onCheckedChange={(checked) =>
                          setValue("remember", !!checked)
                        }
                        className="data-[state=checked]:bg-primary border-primary/20 bg-background/50"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-foreground cursor-pointer"
                      >
                        Ingat saya
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 rounded-xl group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Account */}
                {/* <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <p className="text-sm text-primary text-center">
                    <strong>Akun Demo:</strong> admin@supplydashboard.com /
                    password123
                  </p>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Feature Showcase */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
          <div className="max-w-2xl">
            {/* Main Feature Card */}
            <div className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-primary/5 border border-primary/10 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    Siap Enterprise
                  </h3>
                  <p className="text-muted-foreground">
                    Dipercaya 500+ perusahaan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                      <div className="text-primary">{feature.icon}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  <CheckCircle className="h-4 w-4 inline mr-1 text-primary" />
                  Aman & Terpercaya
                </div>
                <div className="text-muted-foreground">
                  <CheckCircle className="h-4 w-4 inline mr-1 text-primary" />
                  99.9% Uptime
                </div>
                <div className="text-muted-foreground">
                  <CheckCircle className="h-4 w-4 inline mr-1 text-primary" />
                  Support 24/7
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="text-foreground">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  500+
                </div>
                <div className="text-muted-foreground text-sm">Perusahaan</div>
              </div>
              <div className="text-foreground">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  99.8%
                </div>
                <div className="text-muted-foreground text-sm">Kepuasan</div>
              </div>
              <div className="text-foreground">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-muted-foreground text-sm">Support</div>
              </div>
            </div>

            {/* Powered by MafiinCloud Footer */}
            <div className="mt-8 text-center">
              <div
                className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                onClick={handleMafiinCloudClick}
              >
                <span className="text-sm">Powered by</span>
                <div className="flex items-center space-x-2 bg-primary/10 px-3 py-2 rounded-lg group-hover:bg-primary/15 transition-colors">
                  <img
                    src="https://www.mafiincloud.com/images/logo/MB.png"
                    alt="MafiinCloud"
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      // Fallback jika gambar gagal load
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      const fallback = document.createElement("span");
                      fallback.className = "text-primary font-bold text-sm";
                      fallback.textContent = "MC";
                      parent.appendChild(fallback);
                    }}
                  />
                  <span className="font-semibold text-primary">
                    MafiinCloud
                  </span>
                  <ExternalLink className="h-3 w-3 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
