"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

export default function DashboardPage() {
  const { data: productsData } = useProducts({ status: "active", limit: 100 });
  const { data: ordersData } = useOrders({ limit: 100 });
  const { data: pendingOrders } = useOrders({ status: "pending", limit: 5 });

  const totalProducts = productsData?.meta.total ?? 0;
  const totalOrders = ordersData?.meta.total ?? 0;

  const lowStockProducts =
    productsData?.data.filter(
      (p) => p.stock > 0 && p.stock <= p.lowStockAlert,
    ) ?? [];

  const outOfStockProducts =
    productsData?.data.filter((p) => p.stock === 0) ?? [];

  const confirmedOrders =
    ordersData?.data.filter((o: { status: string; }) => o.status === "confirmed").length ?? 0;

  const cancelledOrders =
    ordersData?.data.filter((o: { status: string; }) => o.status === "cancelled").length ?? 0;

  const pendingCount =
    ordersData?.data.filter((o: { status: string }) => o.status === "pending")
      .length ?? 0;

  const stats = [
    {
      label: "Productos activos",
      value: totalProducts,
      icon: Package,
      color: "blue",
      href: "/dashboard/products",
    },
    {
      label: "Órdenes totales",
      value: totalOrders,
      icon: ShoppingBag,
      color: "green",
      href: "/dashboard/orders",
    },
    {
      label: "Órdenes pendientes",
      value: pendingCount,
      icon: Clock,
      color: "orange",
      href: "/dashboard/orders?status=pending",
    },
    {
      label: "Stock bajo",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "red",
      href: "/dashboard/products",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400",
    orange:
      "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
  };

  const quickLinks = [
    {
      href: "/dashboard/products",
      label: "Gestionar productos",
      icon: Package,
    },
    { href: "/dashboard/orders", label: "Ver órdenes", icon: ShoppingBag },
    { href: "/dashboard/inventory", label: "Inventario", icon: TrendingUp },
    {
      href: "/dashboard/settings",
      label: "Configuración",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Órdenes recientes pendientes */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Órdenes pendientes
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingOrders?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <p className="text-sm text-gray-400">No hay órdenes pendientes</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingOrders?.data.map((order) => (
                <Link
                  key={order._id ?? order.id}
                  href={`/dashboard/orders/${order._id ?? order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      {order.customerName} • {order.customerPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      ${order.total?.toFixed(2)}
                    </span>
                    <span className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                      Pendiente
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-4">
          {/* Resumen órdenes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              Estado de órdenes
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-orange-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pendientes</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {pendingCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirmadas</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {confirmedOrders}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Canceladas</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {cancelledOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Productos sin stock */}
          {outOfStockProducts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950 rounded-2xl border border-red-200 dark:border-red-800 p-4 flex flex-col gap-3">
              <h2 className="font-bold text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Sin stock ({outOfStockProducts.length})
              </h2>
              <div className="flex flex-col gap-1">
                {outOfStockProducts.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/products/${p.id}`}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline truncate"
                  >
                    • {p.name}
                  </Link>
                ))}
                {outOfStockProducts.length > 3 && (
                  <span className="text-xs text-red-400">
                    +{outOfStockProducts.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stock bajo */}
          {lowStockProducts.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950 rounded-2xl border border-orange-200 dark:border-orange-800 p-4 flex flex-col gap-3">
              <h2 className="font-bold text-orange-700 dark:text-orange-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Stock bajo ({lowStockProducts.length})
              </h2>
              <div className="flex flex-col gap-1">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/products/${p.id}`}
                    className="text-xs text-orange-600 dark:text-orange-400 hover:underline truncate flex items-center justify-between"
                  >
                    <span className="truncate">• {p.name}</span>
                    <span className="shrink-0 ml-2 font-medium">
                      {p.stock} ud.
                    </span>
                  </Link>
                ))}
                {lowStockProducts.length > 3 && (
                  <span className="text-xs text-orange-400">
                    +{lowStockProducts.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Accesos rápidos */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              Accesos rápidos
            </h2>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
