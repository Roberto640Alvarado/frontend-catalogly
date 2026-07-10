"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  Store,
  Globe,
  Phone,
  Mail,
  MapPin,
  Upload,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  X,
} from "lucide-react";
import { useBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
import { uploadService } from "@/services/upload.service";

const schema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { data: business, isLoading } = useBusiness();
  const updateBusiness = useUpdateBusiness();

  const [logo, setLogo] = useState<string>("");
  const [banner, setBanner] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (business) {
      reset({
        name: business.name ?? "",
        description: business.description ?? "",
        whatsapp: business.whatsapp ?? "",
        email: business.email ?? "",
        address: business.address ?? "",
        instagram: business.instagram ?? "",
        facebook: business.facebook ?? "",
        tiktok: business.tiktok ?? "",
      });
      setLogo(business.logo ?? "");
      setBanner(business.banner ?? "");
    }
  }, [business, reset]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadService.image(file);
      setLogo(url);
    } catch {
      setError("Error al subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadService.image(file);
      setBanner(url);
    } catch {
      setError("Error al subir el banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    setError("");
    try {
      await updateBusiness.mutateAsync({ ...formData, logo, banner });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error al guardar la configuración");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Datos de tu negocio</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Logo y Banner */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-5">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-blue-600" />
            Imágenes del negocio
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo
              </p>
              <div className="relative w-full aspect-square max-w-[160px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
                {logo ? (
                  <>
                    <Image
                      src={logo}
                      alt="Logo"
                      fill
                      sizes="160px"
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {uploadingLogo ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Subir logo
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {!logo && (
                <label className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline w-fit">
                  <Upload className="w-3 h-3" />
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Banner */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Banner
              </p>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
                {banner ? (
                  <>
                    <Image
                      src={banner}
                      alt="Banner"
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBanner("")}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {uploadingBanner ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Subir banner
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBanner}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {!banner && (
                <label className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline w-fit">
                  <Upload className="w-3 h-3" />
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBanner}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Info básica */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            Información del negocio
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del negocio <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Mi Negocio"
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                  errors.name
                    ? "border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
              {errors.name && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                {...register("description")}
                placeholder="Descripción de tu negocio..."
                rows={3}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            Contacto
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                WhatsApp
              </label>
              <input
                {...register("whatsapp")}
                placeholder="+503 7777 7777"
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="negocio@email.com"
                className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                  errors.email
                    ? "border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Dirección
              </label>
              <input
                {...register("address")}
                placeholder="Dirección del negocio"
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Redes sociales
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                Instagram
              </label>
              <input
                {...register("instagram")}
                placeholder="@minegocio"
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                Facebook
              </label>
              <input
                {...register("facebook")}
                placeholder="facebook.com/minegocio"
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                TikTok
              </label>
              <input
                {...register("tiktok")}
                placeholder="@minegocio"
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Error / éxito */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Configuración guardada correctamente
            </p>
          </div>
        )}

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>
    </div>
  );
}
