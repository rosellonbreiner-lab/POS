"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Wrench, 
  Package, 
  ShoppingCart, 
  FileText, 
  ClipboardList, 
  DollarSign, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Barcode, 
  Search, 
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Plus,
  Printer,
  Trash2,
  Calculator,
  UserCheck,
  CheckCircle2,
  CreditCard,
  Camera,
  Menu,
  X,
  Building2,
  Store,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LocationChip } from "@/components/ui/LocationChip";
import { Input } from "@/components/ui/Input";
import { useBarcodeScanner } from "@/features/scanner/useBarcodeScanner";
import { LoginForm } from "@/components/auth/LoginForm";
import { CreateProductModal } from "@/components/inventory/CreateProductModal";
import { LocationDetailsModal } from "@/components/inventory/LocationDetailsModal";
import { CreateWorkOrderModal } from "@/components/orders/CreateWorkOrderModal";
import { CreateSaleModal } from "@/components/sales/CreateSaleModal";
import { CreateQuoteModal } from "@/components/quotes/CreateQuoteModal";
import { EditOrderPartsModal } from "@/components/orders/EditOrderPartsModal";
import { SettingsView } from "@/components/settings/SettingsView";
import { AuditView } from "@/components/audit/AuditView";
import { CreditsView } from "@/components/credits/CreditsView";
import { SalesView } from "@/components/sales/SalesView";
import { CashAccountingView } from "@/components/cash/CashAccountingView";
import { TicketModal, TicketData } from "@/components/common/TicketModal";
import { CameraScannerModal } from "@/components/common/CameraScannerModal";

const TAB_TO_PATH: Record<string, string> = {
  "Dashboard": "/dashboard",
  "Inventario & Kardex": "/inventario",
  "Punto de Venta (POS)": "/pos",
  "Órdenes de Trabajo": "/ordenes",
  "Cotizaciones": "/cotizaciones",
  "Créditos": "/creditos",
  "Contabilidad & Caja": "/contabilidad",
  "Auditoría de Seguridad": "/auditoria",
  "Configuración": "/configuracion",
};

const PATH_TO_TAB: Record<string, string> = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/inventario": "Inventario & Kardex",
  "/pos": "Punto de Venta (POS)",
  "/ventas": "Punto de Venta (POS)",
  "/ordenes": "Órdenes de Trabajo",
  "/cotizaciones": "Cotizaciones",
  "/creditos": "Créditos",
  "/contabilidad": "Contabilidad & Caja",
  "/caja": "Contabilidad & Caja",
  "/auditoria": "Auditoría de Seguridad",
  "/configuracion": "Configuración",
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Datos reales
  const [products, setProducts] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any>(null);
  const [selectedProductForLocation, setSelectedProductForLocation] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  // Estados para Borrar y Terminar Órdenes de Trabajo
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [orderToComplete, setOrderToComplete] = useState<any | null>(null);
  const [completePaymentType, setCompletePaymentType] = useState<string>("EFECTIVO");
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [motorcycleFilter, setMotorcycleFilter] = useState("TODAS");

  // Configuración del Taller (Logo, nombre, teléfono) y Tickets de Impresión
  const [workshopConfig, setWorkshopConfig] = useState<any>(null);
  const [activeTicketData, setActiveTicketData] = useState<TicketData | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<any | null>(null);
  const [quoteToConvert, setQuoteToConvert] = useState<any | null>(null);
  const [convertPaymentType, setConvertPaymentType] = useState<string>("EFECTIVO");

  // Multi-Empresa (Soporte para múltiples microempresas: Talleres de motos, tiendas, minimarkets)
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("ALL");

  // 1. Verificar sesión con timeout de protección para móviles
  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setCheckingAuth(false);
    }, 1500);

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.user) {
          setUser(data.user);
          if (data.user.role !== "SUPERADMIN" && data.user.companyId) {
            setSelectedCompanyId(data.user.companyId);
          }
          if (data.companies) {
            setAvailableCompanies(data.companies);
          }
        }
      })
      .catch((err) => {
        console.warn("Auth check warning:", err);
      })
      .finally(() => {
        if (isMounted) {
          clearTimeout(fallbackTimer);
          setCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // 2. Cargar todos los datos reales
  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [resDash, resProd, resOrd, resSales, resQuotes, resCredits, resSettings, resCompanies] = await Promise.all([
        fetch("/api/dashboard"),
        fetch(`/api/products?q=${encodeURIComponent(quickSearch)}`),
        fetch("/api/orders"),
        fetch("/api/sales"),
        fetch("/api/quotes"),
        fetch("/api/credits"),
        fetch("/api/settings"),
        fetch("/api/companies"),
      ]);

      const [dataDash, dataProd, dataOrd, dataSales, dataQuotes, dataCredits, dataSettings, dataCompanies] = await Promise.all([
        resDash.json(),
        resProd.json(),
        resOrd.json(),
        resSales.json(),
        resQuotes.json(),
        resCredits.json(),
        resSettings.json(),
        resCompanies.json(),
      ]);

      if (dataDash.kpis) setDashboardData(dataDash);
      if (dataProd.products) setProducts(dataProd.products);
      if (dataOrd.orders) setWorkOrders(dataOrd.orders);
      if (dataSales.invoices) setInvoices(dataSales.invoices);
      if (dataQuotes.quotes) setQuotes(dataQuotes.quotes);
      if (dataCredits.credits) setCredits(dataCredits.credits);
      if (dataSettings.config) setWorkshopConfig(dataSettings.config);
      if (dataCompanies.companies) {
        setAvailableCompanies(dataCompanies.companies);
        if (user.role !== "SUPERADMIN" && user.companyId) {
          setSelectedCompanyId(user.companyId);
        }
      }
    } catch (e) {
      console.error("Error al cargar datos:", e);
    } finally {
      setLoading(false);
    }
  };

  // Empresa activa actual calculada
  const activeCompany = useMemo(() => {
    if (selectedCompanyId && selectedCompanyId !== "ALL") {
      const found = availableCompanies.find((c) => c.id === selectedCompanyId);
      if (found) return found;
    }
    if (user?.company) return user.company;
    if (availableCompanies.length > 0) return availableCompanies[0];
    return {
      id: "comp-default",
      name: workshopConfig?.name || "MotoTaller TS7",
      type: "TALLER_MOTOS",
      slogan: workshopConfig?.slogan || "Repuestos & Taller",
      nit: workshopConfig?.nit || "901.452.889-1",
      phone: workshopConfig?.phone || "",
      address: workshopConfig?.address || "",
      receiptMessage: workshopConfig?.receiptMessage || "¡Gracias por su compra!",
      logoUrl: workshopConfig?.logoUrl || "",
    };
  }, [selectedCompanyId, availableCompanies, user, workshopConfig]);

  const isWorkshop = selectedCompanyId === "ALL" || activeCompany.type === "TALLER_MOTOS";

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Búsqueda rápida de repuestos optimizada con Debounce de 300ms (evita sobrecargar la BD en cada tecla)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(quickSearch.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.products) setProducts(d.products);
        })
        .catch((e) => console.error("Error en búsqueda rápida:", e));
    }, 300);

    return () => clearTimeout(timer);
  }, [user, quickSearch]);

  // 3. Pistola Láser (solo activa cuando el usuario está autenticado)
  useBarcodeScanner({
    enabled: !!user,
    onScan: (code) => {
      setLastScanned(code);
      setIsProductModalOpen(true);
    },
  });

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar orden");

      setOrderToDelete(null);
      await loadAllData();
    } catch (err: any) {
      console.error("Error al eliminar orden:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar repuesto");

      setProductToDelete(null);
      await loadAllData();
      setNotificationMsg({ type: "success", text: data.message || "Artículo retirado del inventario." });
    } catch (err: any) {
      console.error("Error al eliminar repuesto:", err);
      setNotificationMsg({ type: "error", text: err.message || "Error al eliminar repuesto" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderToComplete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderToComplete.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE_AND_INVOICE",
          paymentType: completePaymentType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al terminar orden");

      const completedInvoice = data.invoice;
      setOrderToComplete(null);
      await loadAllData();

      // Abrir automáticamente el ticket térmico para imprimir
      if (completedInvoice) {
        handlePrintInvoiceTicket(completedInvoice);
      }
    } catch (err: any) {
      console.error("Error al finalizar orden:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintInvoiceTicket = (inv: any) => {
    if (!inv) return;
    const ticketData: TicketData = {
      type: "VENTA",
      consecutive: inv.consecutive,
      date: new Date(inv.createdAt || Date.now()).toLocaleString("es-CO"),
      customerName: inv.customer?.name || "Consumidor Final",
      customerPhone: inv.customer?.phone || undefined,
      paymentType: inv.paymentType || "EFECTIVO",
      items: (inv.items || []).map((i: any) => ({
        name: i.product?.name || i.description || "Repuesto",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.totalPrice || i.unitPrice * i.quantity,
      })),
      total: inv.total,
      workshopConfig: activeCompany || workshopConfig || {
        name: "MotoTaller Maicao",
        slogan: "Especialistas en Reparación y Repuestos Multimarca",
        nit: "901.452.889-1",
        phone: "(+57) 300 123 4567",
        address: "Calle 16 # 10-45, Maicao, La Guajira",
      },
    };
    setActiveTicketData(ticketData);
  };

  const handlePrintQuoteTicket = (q: any) => {
    if (!q) return;
    const ticketData: TicketData = {
      type: "COTIZACION",
      consecutive: q.consecutive,
      date: new Date(q.createdAt || Date.now()).toLocaleString("es-CO"),
      customerName: q.customer?.name || "Cliente Cotización",
      customerPhone: q.customer?.phone || undefined,
      plate: q.motorcycle?.plate || undefined,
      motoModel: q.motorcycle?.model || undefined,
      items: (q.items || []).map((i: any) => ({
        name: i.description || i.product?.name || (isWorkshop ? "Repuesto" : "Producto"),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.totalPrice || i.unitPrice * i.quantity,
      })),
      total: q.total,
      workshopConfig: activeCompany || workshopConfig || {
        name: "MotoTaller Maicao",
        slogan: "Especialistas en Reparación y Repuestos Multimarca",
        nit: "901.452.889-1",
        phone: "(+57) 300 123 4567",
        address: "Calle 16 # 10-45, Maicao, La Guajira",
      },
    };
    setActiveTicketData(ticketData);
  };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar cotización");

      setQuoteToDelete(null);
      await loadAllData();
    } catch (err: any) {
      console.error("Error al eliminar cotización:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteConvertQuote = async () => {
    if (!quoteToConvert) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quoteToConvert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONVERT_TO_SALE",
          paymentType: convertPaymentType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al convertir cotización a venta");

      const convertedInvoice = data.invoice;
      setQuoteToConvert(null);
      await loadAllData();
      if (convertedInvoice) {
        handlePrintInvoiceTicket(convertedInvoice);
      }
    } catch (err: any) {
      console.error("Error al convertir cotización:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    if (motorcycleFilter === "TODAS") return true;
    const fit = (prod.motorcycleFit || "").toLowerCase();
    if (motorcycleFilter === "BOXER") return fit.includes("boxer");
    if (motorcycleFilter === "NKD") return fit.includes("nkd");
    if (motorcycleFilter === "ECO") return fit.includes("eco") || fit.includes("splendor");
    if (motorcycleFilter === "FZ") return fit.includes("fz");
    if (motorcycleFilter === "CRYPTON") return fit.includes("crypton");
    if (motorcycleFilter === "PULSAR") return fit.includes("pulsar");
    if (motorcycleFilter === "SUZUKI") return fit.includes("suzuki") || fit.includes("ax") || fit.includes("gixxer");
    if (motorcycleFilter === "UNIVERSAL") return fit.includes("universal");
    return true;
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/");
    }
  };

  // Filtrar módulos permitidos según el rol del usuario y los permisos configurados por el Superadmin
  const navigationItems = useMemo(() => {
    if (!user) return [];

    const allItems = [
      { label: "Dashboard", icon: BarChart3 },
      { label: "Inventario & Kardex", icon: Package, badge: `${products.length}` },
      { label: "Punto de Venta (POS)", icon: ShoppingCart, badge: `${invoices.length}` },
      { label: "Órdenes de Trabajo", icon: ClipboardList, badge: `${workOrders.filter((o) => o.status !== "ENTREGADA_Y_FACTURADA").length}` },
      { label: "Cotizaciones", icon: FileText, badge: `${quotes.length}` },
      { label: "Créditos", icon: CreditCard, badge: `${credits.filter((c) => c.status !== "PAGADO").length}` },
      { label: "Contabilidad & Caja", icon: DollarSign },
      { label: "Auditoría de Seguridad", icon: ShieldCheck },
      { label: "Configuración", icon: Settings },
    ];

    return allItems.filter((item) => {
      // 0. Si el negocio activo es una tienda o minimarket (no taller de motos), ocultar Órdenes de Trabajo mecánicas
      if (item.label === "Órdenes de Trabajo" && !isWorkshop) {
        return false;
      }

      // 1. Auditoría de Seguridad: SOLO SUPERADMIN (retirado para Trabajador y para Dueño/Admin)
      if (item.label === "Auditoría de Seguridad") {
        return user.role === "SUPERADMIN";
      }

      // 2. Configuración: Retirado para Trabajador (solo Superadmin y Admin)
      if (item.label === "Configuración") {
        if (user.role === "TRABAJADOR") return false;
        if (user.role === "ADMIN") {
          return workshopConfig?.roleModulePermissions?.ADMIN?.["Configuración"] ?? true;
        }
        return true;
      }

      // 3. Superadmin siempre ve todos los módulos
      if (user.role === "SUPERADMIN") return true;

      // 4. Para ADMIN y TRABAJADOR, consultar los permisos configurados dinámicamente por el Superadmin
      const rolePermissions = workshopConfig?.roleModulePermissions?.[user.role];
      if (rolePermissions && rolePermissions[item.label] !== undefined) {
        return Boolean(rolePermissions[item.label]);
      }

      // Valores por defecto seguros si aún no han sido configurados
      if (user.role === "TRABAJADOR") {
        if (item.label === "Créditos" || item.label === "Contabilidad & Caja") {
          return false;
        }
      }

      return true;
    });
  }, [user, products.length, invoices.length, workOrders, quotes.length, credits, workshopConfig, isWorkshop, activeCompany]);

  // Cambio seguro de módulo con actualización del path en la URL del navegador
  const navigateToTab = (tabName: string) => {
    // 1. Control de acceso seguro: verificar que el usuario tenga permitido este módulo
    const isAllowed = navigationItems.some((item) => item.label === tabName);
    if (!isAllowed) {
      setNotificationMsg({
        type: "error",
        text: `Acceso restringido: El módulo "${tabName}" no está habilitado para tu perfil.`,
      });
      return;
    }

    setActiveTab(tabName);
    const targetPath = TAB_TO_PATH[tabName] || "/dashboard";
    if (typeof window !== "undefined" && window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
      window.history.pushState(null, "", targetPath);
    }
  };

  // Sincronización segura de la ruta inicial desde la barra del navegador (permite refrescar o entrar directo a /inventario, /pos, etc.)
  useEffect(() => {
    if (!user || navigationItems.length === 0) return;

    const currentPath = window.location.pathname.toLowerCase();
    const matchedTab = PATH_TO_TAB[currentPath];

    if (matchedTab) {
      const isAllowed = navigationItems.some((item) => item.label === matchedTab);
      if (isAllowed) {
        setActiveTab(matchedTab);
      } else {
        // Redirigir y alertar si un usuario intenta ingresar por URL a un módulo prohibido para su rol
        setNotificationMsg({
          type: "error",
          text: `Acceso no autorizado: El módulo "${matchedTab}" está restringido para tu perfil.`,
        });
        const defaultTab = navigationItems[0]?.label || "Dashboard";
        setActiveTab(defaultTab);
        window.history.replaceState(null, "", TAB_TO_PATH[defaultTab] || "/dashboard");
      }
    } else if (currentPath === "/" || currentPath === "") {
      const defaultPath = TAB_TO_PATH[activeTab] || "/dashboard";
      window.history.replaceState(null, "", defaultPath);
    }
  }, [user, navigationItems]);

  // Manejo de botones "Atrás" y "Adelante" del navegador (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname.toLowerCase();
      const matchedTab = PATH_TO_TAB[currentPath];
      if (matchedTab && navigationItems.some((item) => item.label === matchedTab)) {
        setActiveTab(matchedTab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigationItems]);

  // Si la pestaña actual no está permitida para el rol, redirigir al primer módulo disponible
  useEffect(() => {
    if (navigationItems.length > 0 && !navigationItems.some((i) => i.label === activeTab)) {
      setActiveTab(navigationItems[0].label);
      window.history.replaceState(null, "", TAB_TO_PATH[navigationItems[0].label] || "/dashboard");
    }
  }, [navigationItems, activeTab]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0D1117] flex flex-col items-center justify-center p-4">
        {/* Fondo cibernético con la nueva paleta */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(90, 169, 230, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(90, 169, 230, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute w-96 h-96 bg-gradient-to-tr from-[#1F3A5F]/40 to-[#5AA9E6]/30 blur-3xl pointer-events-none rounded-full" />

        {/* Presentación animada de arranque */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-[#1F3A5F]/70 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6] shadow-[0_0_30px_rgba(90,169,230,0.35)] relative">
            <Wrench className="w-8 h-8 text-[#5AA9E6] animate-pulse" />
            <div className="absolute -inset-1 rounded-2xl border border-[#5AA9E6]/50 animate-ping opacity-30"></div>
          </div>

          <div>
            <h2 className="text-xl font-black text-[#EAF4F4] tracking-wider uppercase font-[family-name:var(--font-space-grotesk)]">
              MOTO<span className="text-[#5AA9E6]">TALLER</span>
            </h2>
            <p className="text-xs text-[#94A3B8] tracking-widest uppercase font-mono mt-1">
              Encendiendo Sistemas y Banco de Datos...
            </p>
          </div>

          {/* Barra de energía neón animada */}
          <div className="w-64 h-1.5 bg-[#222831] rounded-full overflow-hidden border border-[#5AA9E6]/30">
            <div className="h-full bg-gradient-to-r from-[#1F3A5F] via-[#5AA9E6] to-[#EAF4F4] rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={(u) => setUser(u)} />;
  }

  const kpis = [
    {
      title: "Ventas de Hoy",
      value: `$${(dashboardData?.kpis?.todaySales || 0).toLocaleString("es-CO")} COP`,
      change: `${invoices.length} facturas`,
      isUp: true,
      icon: ShoppingCart,
    },
    {
      title: "Utilidad Estimada",
      value: `$${(dashboardData?.kpis?.todayProfit || 0).toLocaleString("es-CO")} COP`,
      change: "margen neto",
      isUp: true,
      icon: TrendingUp,
    },
    {
      title: "Motos en Taller",
      value: `${workOrders.filter(o => o.status !== "ENTREGADA_Y_FACTURADA").length} activas`,
      change: `${workOrders.length} totales`,
      isUp: true,
      icon: ClipboardList,
    },
    {
      title: "Cotizaciones",
      value: `${quotes.length} realizadas`,
      change: "estimaciones",
      isUp: true,
      icon: Calculator,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Modales */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        initialBarcode={lastScanned || ""}
        onClose={() => {
          setIsProductModalOpen(false);
          setLastScanned(null);
        }}
        onProductCreated={loadAllData}
      />

      <CreateWorkOrderModal
        isOpen={isOrderModalOpen}
        products={products}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderCreated={loadAllData}
      />

      <CreateSaleModal
        isOpen={isSaleModalOpen}
        products={products}
        onClose={() => setIsSaleModalOpen(false)}
        onSaleCreated={(createdInvoice) => {
          loadAllData();
          if (createdInvoice) {
            handlePrintInvoiceTicket(createdInvoice);
          }
        }}
      />

      <CreateQuoteModal
        isOpen={isQuoteModalOpen}
        products={products}
        onClose={() => setIsQuoteModalOpen(false)}
        onQuoteCreated={(createdQuote) => {
          loadAllData();
          if (createdQuote) {
            handlePrintQuoteTicket(createdQuote);
          }
        }}
      />

      {/* Modal de Impresión de Ticket Térmico */}
      <TicketModal
        isOpen={Boolean(activeTicketData)}
        onClose={() => setActiveTicketData(null)}
        data={activeTicketData}
      />

      {/* Modal de Ubicación Física en Almacén */}
      <LocationDetailsModal
        isOpen={Boolean(selectedProductForLocation)}
        onClose={() => setSelectedProductForLocation(null)}
        product={selectedProductForLocation}
      />

      {selectedOrderForEdit && (
        <EditOrderPartsModal
          order={selectedOrderForEdit}
          products={products}
          isOpen={true}
          onClose={() => setSelectedOrderForEdit(null)}
          onUpdated={() => {
            loadAllData();
            // Refrescar orden seleccionada
            fetch(`/api/orders/${selectedOrderForEdit.id}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.order) setSelectedOrderForEdit(d.order);
              });
          }}
        />
      )}

      {/* Modal Dark Glass: Confirmar Eliminación de Orden */}
      {orderToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13161F] border border-red-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                ¿Eliminar Orden #{orderToDelete.consecutive}?
              </h3>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Motocicleta: <b className="text-white">{orderToDelete.motorcycle?.plate}</b> ({orderToDelete.motorcycle?.model}) · Cliente: <b className="text-white">{orderToDelete.customer?.name}</b>
              </p>
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#34D399] text-left space-y-1">
                <p className="font-semibold text-white">✓ Sin pérdida de inventario:</p>
                <p>Todos los repuestos asignados a esta moto se devolverán de inmediato a la estantería física de bodega.</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={actionLoading}
                onClick={() => setOrderToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={actionLoading}
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                {actionLoading ? "Eliminando..." : "Sí, Eliminar Orden"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dark Glass: Confirmar Eliminación de Artículo de Inventario */}
      {productToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13161F] border border-red-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                ¿Eliminar Repuesto del Inventario?
              </h3>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Estás a punto de retirar <b className="text-white">"{productToDelete.name}"</b> (SKU: {productToDelete.sku}) del catálogo de venta.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-left space-y-1">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Stock registrado:</span>
                <span className="font-bold text-white">{productToDelete.currentStock} unidades</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Precio catálogo:</span>
                <span className="font-bold text-[#5AA9E6]">${productToDelete.salePrice.toLocaleString("es-CO")} COP</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-left">
              ⚠️ Este repuesto no se podrá volver a facturar ni asignar a motos. Quedará retirado de la venta.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={actionLoading}
                onClick={() => setProductToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={actionLoading}
                onClick={handleDeleteProduct}
                className="bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                {actionLoading ? "Eliminando..." : "Sí, Eliminar Artículo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dark Glass: Terminar y Facturar Orden */}
      {orderToComplete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13161F] border border-[#34D399]/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Dar por Terminada y Facturar Repuestos
              </h3>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Orden #{orderToComplete.consecutive} · Moto: <b className="text-white">{orderToComplete.motorcycle?.plate}</b>
              </p>
              <div className="text-2xl font-bold text-[#5AA9E6] tabular-nums mt-2">
                ${(orderToComplete.total || 0).toLocaleString("es-CO")} COP
              </div>

              <div className="mt-4 text-left">
                <label className="text-xs text-[#9CA3AF] block mb-1.5 font-medium">Método de Pago Recibido:</label>
                <select
                  className="w-full h-10 px-3 text-sm text-[#F3F4F6] bg-[#1a1d28] border border-white/[0.12] rounded-lg focus:outline-none focus:border-[#34D399]"
                  value={completePaymentType}
                  onChange={(e) => setCompletePaymentType(e.target.value)}
                >
                  <option value="EFECTIVO">Efectivo en Caja</option>
                  <option value="TRANSFERENCIA">Transferencia (Nequi / Daviplata / Bancolombia)</option>
                  <option value="CREDITO">A Crédito (Fiado / Cuenta por Cobrar)</option>
                </select>
              </div>

              {completePaymentType === "CREDITO" ? (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-left">
                  ⚠ Esta orden se registrará en el <b>Módulo de Créditos</b>. El cliente podrá realizar abonos progresivos hasta saldar la cuenta.
                </div>
              ) : (
                <div className="mt-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#34D399] text-left">
                  ✓ Los repuestos utilizados quedarán marcados como VENDIDOS y se abrirá el ticket de recibo para imprimir.
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={actionLoading}
                onClick={() => setOrderToComplete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={actionLoading}
                onClick={handleCompleteOrder}
                className="bg-[#34D399] hover:bg-[#10B981] text-black font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                {actionLoading ? "Procesando Venta..." : "Confirmar y Facturar Venta"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dark Glass: Confirmar Eliminación de Cotización */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13161F] border border-red-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                ¿Eliminar Cotización #COT-{quoteToDelete.consecutive}?
              </h3>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Cliente: <b className="text-white">{quoteToDelete.customer?.name}</b> · Total: <b className="text-[#22D3EE]">${(quoteToDelete.total || 0).toLocaleString("es-CO")} COP</b>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-2">
                Esta cotización se eliminará del registro para evitar acumulación innecesaria.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={actionLoading}
                onClick={() => setQuoteToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={actionLoading}
                onClick={handleDeleteQuote}
                className="bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                {actionLoading ? "Eliminando..." : "Sí, Eliminar Cotización"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dark Glass: Pasar Cotización a Venta Directa */}
      {quoteToConvert && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#13161F] border border-[#22D3EE]/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 text-[#22D3EE] flex items-center justify-center mx-auto">
              <ShoppingCart className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Convertir Cotización a Venta Oficial
              </h3>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Cotización #COT-{quoteToConvert.consecutive} · Cliente: <b className="text-white">{quoteToConvert.customer?.name}</b>
              </p>
              <div className="text-2xl font-bold text-[#22D3EE] tabular-nums mt-2">
                ${(quoteToConvert.total || 0).toLocaleString("es-CO")} COP
              </div>

              <div className="mt-4 text-left">
                <label className="text-xs text-[#9CA3AF] block mb-1.5 font-medium">Método de Pago Recibido:</label>
                <select
                  className="w-full h-10 px-3 text-sm text-[#F3F4F6] bg-[#1a1d28] border border-white/[0.12] rounded-lg focus:outline-none focus:border-[#22D3EE]"
                  value={convertPaymentType}
                  onChange={(e) => setConvertPaymentType(e.target.value)}
                >
                  <option value="EFECTIVO">Efectivo en Caja</option>
                  <option value="TRANSFERENCIA">Transferencia (Nequi / Daviplata / Bancolombia)</option>
                  <option value="CREDITO">A Crédito (Fiado / Cuenta por Cobrar)</option>
                </select>
              </div>

              {convertPaymentType === "CREDITO" ? (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-left">
                  ⚠ Esta cotización pasará al <b>Módulo de Créditos</b>. El cliente podrá realizar abonos progresivos hasta cancelarla.
                </div>
              ) : (
                <div className="mt-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#34D399] text-left">
                  ✓ Se descontará el stock de inventario de cada repuesto cotizado y se emitirá la factura lista para imprimir.
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={actionLoading}
                onClick={() => setQuoteToConvert(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteConvertQuote}
                className="bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                {actionLoading ? "Generando Factura..." : "Confirmar Venta y Generar Ticket"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Menú Móvil Desplegable (Drawer para celulares) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex">
          <div className="w-72 bg-[#13161F] border-r border-white/20 p-5 flex flex-col justify-between h-full shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeCompany?.logoUrl ? (
                    <img
                      src={activeCompany.logoUrl}
                      alt="Logo Negocio"
                      className="w-10 h-10 rounded-xl object-contain bg-white/10 p-0.5 border border-white/20"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeCompany.type === "TALLER_MOTOS"
                        ? "bg-gradient-to-tr from-[#5AA9E6] to-[#38BDF8]"
                        : "bg-gradient-to-tr from-[#34D399] to-[#10B981]"
                    }`}>
                      {activeCompany.type === "TALLER_MOTOS" ? (
                        <Wrench className="w-5 h-5 text-white" />
                      ) : (
                        <Store className="w-5 h-5 text-white" />
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-sm text-white truncate max-w-[160px]">{activeCompany?.name || "MotoTaller"}</h2>
                    <p className="text-[11px] text-[#9CA3AF]">{activeCompany?.slogan || "Menú Comercial"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#9CA3AF] hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navegación Móvil */}
              <nav className="space-y-1 text-sm font-medium">
                {navigationItems.map((item, idx) => {
                  const active = activeTab === item.label;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        navigateToTab(item.label);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                        active
                          ? "bg-[#5AA9E6]/20 text-[#5AA9E6] border border-[#5AA9E6]/40 font-semibold"
                          : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant={active ? "primary" : "neutral"}>{item.badge}</Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Perfil en Móvil */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#5AA9E6]/20 text-[#5AA9E6] border border-[#5AA9E6]/40 flex items-center justify-center text-xs font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-[#9CA3AF] text-[10px]">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-red-400 p-1.5 rounded-md hover:bg-white/[0.05]">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Sidebar (Para pantallas de PC y Tablets) */}
      <aside className="w-[235px] glass-strong border-r border-white/[0.12] p-3.5 hidden md:flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          {/* Logo Empresa / Negocio (Foto personalizada o Icono) */}
          <div className="flex items-center gap-2.5 px-1.5">
            {activeCompany?.logoUrl ? (
              <img
                src={activeCompany.logoUrl}
                alt="Logo Negocio"
                className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20 shadow-lg shadow-black/40"
              />
            ) : (
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shrink-0 ${
                activeCompany.type === "TALLER_MOTOS"
                  ? "bg-gradient-to-tr from-[#5AA9E6] to-[#38BDF8] shadow-[#5AA9E6]/30"
                  : "bg-gradient-to-tr from-[#34D399] to-[#10B981] shadow-[#34D399]/30"
              }`}>
                {activeCompany.type === "TALLER_MOTOS" ? (
                  <Wrench className="w-4 h-4 text-white" />
                ) : (
                  <Store className="w-4 h-4 text-white" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-xs text-white tracking-wide font-[family-name:var(--font-space-grotesk)] truncate">
                {activeCompany?.name || "MotoTaller"}
              </h1>
              <p className="text-[10px] text-[#9CA3AF] truncate">
                {activeCompany?.slogan || "Repuestos & Taller"}
              </p>
            </div>
          </div>

          {/* Menú de Navegación Lateral Separado por Módulos */}
          <nav className="space-y-0.5 text-xs font-medium">
            {navigationItems.map((item, idx) => {
              const active = activeTab === item.label;
              return (
                <button
                  key={idx}
                  onClick={() => navigateToTab(item.label)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors cursor-pointer text-left ${
                    active
                      ? "bg-[#5AA9E6]/20 text-[#5AA9E6] border border-[#5AA9E6]/40 font-semibold"
                      : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant={active ? "primary" : "neutral"} className="text-[10px] py-0 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Perfil del usuario activo y Salir */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border ${
              user.role === "SUPERADMIN"
                ? "bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/40"
                : user.role === "ADMIN"
                ? "bg-[#5AA9E6]/20 text-[#5AA9E6] border-[#5AA9E6]/40"
                : "bg-white/[0.1] text-white border-white/20"
            }`}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-[11px] leading-tight">
              <p className="font-medium text-white truncate max-w-[110px]">{user.name}</p>
              <p className="text-[#9CA3AF] text-[9px] font-mono">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[#9CA3AF] hover:text-[#F87171] p-1.5 rounded-md hover:bg-white/[0.05] transition-colors cursor-pointer" 
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar Responsivo (Móvil y PC) */}
        <header className="h-12 border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between glass sticky top-0 z-10 gap-3">
          {/* Botón Menú Móvil */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-[#9CA3AF] hover:text-white p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 w-44 sm:w-64">
              <Input
                icon={<Search className="w-3.5 h-3.5" />}
                placeholder={isWorkshop ? "Buscar repuesto, placa, SKU..." : "Buscar producto, código, SKU..."}
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="h-7.5 text-xs"
              />
            </div>

            {/* Selector de Empresa Activa (Multi-Tenant) */}
            {user.role === "SUPERADMIN" ? (
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/[0.04] border border-[#5AA9E6]/30 hover:border-[#5AA9E6]/60 transition-colors">
                <Building2 className="w-3.5 h-3.5 text-[#5AA9E6] shrink-0" />
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider hidden lg:inline">Empresa:</span>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="bg-transparent text-xs text-[#EAF4F4] font-bold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="ALL" className="bg-[#222831] text-white">🏢 Todas las Empresas</option>
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#222831] text-white">
                      {c.type === "TALLER_MOTOS" ? "🏍️ " : "🏪 "} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <span className="text-xs">{activeCompany.type === "TALLER_MOTOS" ? "🏍️" : "🏪"}</span>
                <span className="text-xs text-white font-semibold truncate max-w-[160px]">
                  {activeCompany.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsQuoteModalOpen(true)}
              className="h-7.5 px-2.5 text-xs font-semibold cursor-pointer"
              title="Crear nueva cotización"
            >
              <Calculator className="w-3.5 h-3.5 sm:mr-1 text-[#5AA9E6]" />
              <span className="hidden sm:inline">Cotización</span>
            </Button>

            {isWorkshop && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOrderModalOpen(true)}
                className="h-7.5 px-2.5 text-xs font-semibold cursor-pointer"
                title="Asignar repuestos a moto / Orden de trabajo"
              >
                <Package className="w-3.5 h-3.5 sm:mr-1 text-[#5AA9E6]" />
                <span className="hidden sm:inline">Orden de Trabajo</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSaleModalOpen(true)}
              className="h-7.5 px-3 text-xs font-bold cursor-pointer"
              title="Facturar venta en mostrador (POS)"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:mr-1" />
              <span>Nueva Venta</span>
            </Button>
          </div>
        </header>

        {/* Contenido Separado por Módulos */}
        <div className="p-3.5 sm:p-5 space-y-4 max-w-[1440px] w-full">
          {/* Alerta de Escáner */}
          {lastScanned && (
            <div className="p-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Barcode className="w-4 h-4 text-[#22D3EE]" />
                <span className="text-xs font-medium text-white">
                  Código de barras detectado: <code className="text-[#22D3EE] font-mono">{lastScanned}</code>
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setLastScanned(null)}>
                Cerrar
              </Button>
            </div>
          )}

          {/* Encabezado del Módulo Activo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-space-grotesk)]">
                {activeTab}
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {activeTab === "Dashboard" && "Métricas y resumen general de operaciones de tu almacén de repuestos."}
                {activeTab === "Inventario & Kardex" && "Control de repuestos, stock mínimo y ubicación física en estantes."}
                {activeTab === "Punto de Venta (POS)" && "Facturación rápida en mostrador con desglose por días y calendario."}
                {activeTab === "Órdenes de Trabajo" && "Motos y clientes: asigna o retira repuestos entregados a cada vehículo en tiempo real."}
                {activeTab === "Cotizaciones" && "Calcula cuánto se llevará en repuestos una moto para el cliente."}
                {activeTab === "Créditos" && "Control de repuestos a crédito, fiados a clientes, registro de abonos y saldos pendientes."}
                {activeTab === "Contabilidad & Caja" && "Flujo de caja, ventas de días anteriores con calendario y utilidad neta real."}
                {activeTab === "Auditoría de Seguridad" && "Registro de seguridad de todas las acciones hechas en el taller."}
                {activeTab === "Configuración" && "Ajusta nombre de taller, NIT, teléfono y datos del negocio."}
              </p>
            </div>

            {activeTab === "Inventario & Kardex" && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsCameraScannerOpen(true)}>
                  <Camera className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                  Escanear con Cámara
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsProductModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nuevo Repuesto
                </Button>
              </div>
            )}
            {activeTab === "Órdenes de Trabajo" && (
              <Button variant="primary" size="sm" onClick={() => setIsOrderModalOpen(true)}>
                <Package className="w-3.5 h-3.5 mr-1" />
                Asignar Repuestos a Moto
              </Button>
            )}
            {activeTab === "Cotizaciones" && (
              <Button variant="primary" size="sm" onClick={() => setIsQuoteModalOpen(true)}>
                <Calculator className="w-3.5 h-3.5 mr-1" />
                Nueva Cotización
              </Button>
            )}
          </div>

          {/* 1. MÓDULO DASHBOARD */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {/* KPIs Reales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                  <Card key={idx} className="group hover:border-[#5AA9E6]/40 transition-all duration-200">
                    <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
                      <span className="text-xs font-medium uppercase tracking-wider">{kpi.title}</span>
                      <div className="p-2 rounded-lg bg-white/[0.05] group-hover:bg-[#5AA9E6]/10 group-hover:text-[#5AA9E6] transition-colors">
                        <kpi.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white tabular-nums tracking-tight font-[family-name:var(--font-space-grotesk)]">
                      {kpi.value}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <Badge variant={kpi.isUp ? "success" : "warning"}>
                        {kpi.change}
                      </Badge>
                      <span className="text-[#9CA3AF]">en base de datos</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Accesos Rápidos */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="hover:border-[#5AA9E6]/40 cursor-pointer" onClick={() => setIsSaleModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#5AA9E6]/20 text-[#5AA9E6]">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Facturar en Mostrador</h4>
                      <p className="text-xs text-[#9CA3AF]">Cobra repuestos y descuenta stock</p>
                    </div>
                  </div>
                </Card>

                <Card className="hover:border-[#22D3EE]/40 cursor-pointer" onClick={() => setIsOrderModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE]">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Asignar Repuestos a Moto</h4>
                      <p className="text-xs text-[#9CA3AF]">Abre orden y entrega piezas</p>
                    </div>
                  </div>
                </Card>

                <Card className="hover:border-[#34D399]/40 cursor-pointer" onClick={() => setIsQuoteModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#34D399]/20 text-[#34D399]">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Hacer Cotización</h4>
                      <p className="text-xs text-[#9CA3AF]">Estima repuestos para un cliente</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 2. MÓDULO INVENTARIO & KARDEX */}
          {activeTab === "Inventario & Kardex" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Listado de Repuestos & Ubicaciones Físicas</CardTitle>
                  <CardDescription>
                    Catálogo de repuestos con estantería física ({products.length} productos registrados).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros rápidos por motocicleta */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs text-[#9CA3AF] mr-1 font-semibold uppercase tracking-wider">Motos:</span>
                  {[
                    { id: "TODAS", label: "Todas" },
                    { id: "BOXER", label: "Boxer CT 100" },
                    { id: "NKD", label: "AKT NKD 125" },
                    { id: "ECO", label: "Hero Eco Deluxe" },
                    { id: "FZ", label: "Yamaha FZ 16 / 2.0" },
                    { id: "CRYPTON", label: "Crypton 115" },
                    { id: "PULSAR", label: "Pulsar NS / 180" },
                    { id: "SUZUKI", label: "Suzuki (AX4 / Gixxer)" },
                    { id: "UNIVERSAL", label: "Aceites & Universales" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setMotorcycleFilter(chip.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                        motorcycleFilter === chip.id
                          ? "bg-[#5AA9E6] text-white shadow-md font-bold"
                          : "bg-white/[0.04] text-[#9CA3AF] hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-[#9CA3AF]">
                    Mostrando <b className="text-white">{filteredProducts.length}</b> repuestos
                  </span>
                </div>

                {products.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Package className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-50" />
                    <p className="text-sm text-[#9CA3AF]">No tienes repuestos agregados todavía.</p>
                    <Button variant="primary" size="sm" onClick={() => setIsProductModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Registrar Primer Repuesto
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase text-[#9CA3AF] border-b border-white/[0.08]">
                        <tr>
                          <th className="pb-3 font-semibold">SKU / Repuesto</th>
                          <th className="pb-3 font-semibold whitespace-nowrap min-w-[180px]">Ubicación Física</th>
                          <th className="pb-3 font-semibold">Stock Actual</th>
                          <th className="pb-3 font-semibold">Precio Venta</th>
                          <th className="pb-3 font-semibold">Compatibilidad</th>
                          {(user.role === "SUPERADMIN" || user.role === "ADMIN") && (
                            <th className="pb-3 font-semibold text-right">Acción</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {filteredProducts.map((prod) => {
                          const isLow = prod.currentStock <= prod.minStock;
                          const loc = prod.locations?.[0]?.location;
                          return (
                            <tr key={prod.id} className="hover:bg-white/[0.02]">
                              <td className="py-3.5 pr-4">
                                <div className="font-mono text-xs text-[#22D3EE] font-medium">{prod.sku}</div>
                                <div className="text-white font-medium text-sm mt-0.5">{prod.name}</div>
                                {prod.barcode && (
                                  <div className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">
                                    Barras: {prod.barcode}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 whitespace-nowrap min-w-[180px]">
                                {loc ? (
                                  <LocationChip
                                    estante={loc.shelf}
                                    nivel={loc.level}
                                    posicion={loc.position || undefined}
                                    onClick={() => setSelectedProductForLocation(prod)}
                                  />
                                ) : (
                                  <span className="text-xs text-[#9CA3AF]">Sin ubicación</span>
                                )}
                              </td>
                              <td className="py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold tabular-nums text-white">{prod.currentStock}</span>
                                  <span className="text-xs text-[#9CA3AF]">/ mín {prod.minStock}</span>
                                  {isLow && <Badge variant="warning">Reponer</Badge>}
                                </div>
                              </td>
                              <td className="py-3.5 tabular-nums font-semibold text-white">
                                ${prod.salePrice.toLocaleString("es-CO")} COP
                              </td>
                              <td className="py-3.5 text-xs text-[#9CA3AF]">
                                {prod.motorcycleFit || "Universal"}
                              </td>
                              {(user.role === "SUPERADMIN" || user.role === "ADMIN") && (
                                <td className="py-3.5 text-right">
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setProductToDelete(prod)}
                                    className="h-7 px-2.5 bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                                    title="Eliminar este repuesto que ya no se va a vender"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Eliminar
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 3. MÓDULO ÓRDENES DE TRABAJO (Con gestión dinámica de repuestos) */}
          {activeTab === "Órdenes de Trabajo" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Motos & Repuestos Asignados</CardTitle>
                  <CardDescription>
                    Haz clic en <b>"Poner / Quitar Repuestos"</b> en cualquier moto para gestionar las piezas entregadas en tiempo real.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {workOrders.filter((ord) => ord.status !== "ENTREGADA_Y_FACTURADA").length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <ClipboardList className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-50" />
                    <p className="text-sm text-[#9CA3AF]">No hay motocicletas con repuestos asignados.</p>
                    <Button variant="primary" size="sm" onClick={() => setIsOrderModalOpen(true)}>
                      <Package className="w-4 h-4 mr-1" />
                      Registrar Primera Moto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workOrders
                      .filter((ord) => ord.status !== "ENTREGADA_Y_FACTURADA")
                      .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#5AA9E6]/40 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-lg text-[#5AA9E6]">
                                #{ord.consecutive}
                              </span>
                              <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-white/[0.08] text-white">
                                {ord.motorcycle?.plate}
                              </span>
                              <span className="text-sm font-medium text-white">
                                {ord.motorcycle?.model}
                              </span>
                              <Badge variant="info">{ord.status}</Badge>
                            </div>
                            <p className="text-xs text-[#9CA3AF] mt-1">
                              Cliente: <b className="text-white">{ord.customer?.name}</b> · Tel: {ord.customer?.phone || "Sin teléfono"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-[#9CA3AF] block">Total Orden:</span>
                            <span className="text-xl font-bold text-white tabular-nums">
                              ${ord.total.toLocaleString("es-CO")} COP
                            </span>
                          </div>
                        </div>

                        {/* Diagnóstico */}
                        <div className="mt-3 text-xs bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04] text-[#F3F4F6]">
                          <span className="text-[#9CA3AF] font-medium">Motivo/Trabajo:</span> {ord.diagnosis}
                        </div>

                        {/* Listado de Repuestos en esta moto y Acciones */}
                        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap justify-between items-center gap-3">
                          <div className="text-xs">
                            <span className="text-[#9CA3AF]">Repuestos puestos ({ord.items?.length || 0}): </span>
                            {ord.items?.length === 0 ? (
                              <span className="text-yellow-400">Sin repuestos aún</span>
                            ) : (
                              <span className="text-white font-medium">
                                {ord.items?.map((i: any) => `${i.quantity}x ${i.product?.name || "Repuesto"}`).join(", ")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.status !== "ENTREGADA_Y_FACTURADA" ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectedOrderForEdit(ord)}
                                >
                                  <Package className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                                  Poner / Quitar
                                </Button>

                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setOrderToComplete(ord);
                                    setCompletePaymentType("EFECTIVO");
                                  }}
                                  className="bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 hover:bg-[#34D399] hover:text-black font-semibold transition-all duration-150 cursor-pointer"
                                  title="Dar por terminada y registrar venta de repuestos"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Terminar & Facturar
                                </Button>
                              </>
                            ) : (
                              <Badge variant="success" className="px-3 py-1 font-bold">
                                ✓ VENDIDO & FACTURADO
                              </Badge>
                            )}

                            <Button
                              variant="danger"
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => setOrderToDelete(ord)}
                              className="bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white cursor-pointer"
                              title="Borrar esta orden (los repuestos regresan al inventario)"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Borrar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4. MÓDULO COTIZACIONES */}
          {activeTab === "Cotizaciones" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cotizaciones de Repuestos</CardTitle>
                  <CardDescription>
                    Estimaciones previas para clientes sobre cuánto costarán los repuestos de su motocicleta.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {quotes.filter((q) => q.status !== "CONVERTIDA").length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <FileText className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-50" />
                    <p className="text-sm text-[#9CA3AF]">No tienes cotizaciones registradas.</p>
                    <Button variant="primary" size="sm" onClick={() => setIsQuoteModalOpen(true)}>
                      <Calculator className="w-4 h-4 mr-1" />
                      Crear Primera Cotización
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase text-[#9CA3AF] border-b border-white/[0.08]">
                        <tr>
                          <th className="pb-3 font-semibold">Cotización #</th>
                          <th className="pb-3 font-semibold">Cliente</th>
                          <th className="pb-3 font-semibold">Moto / Placa</th>
                          <th className="pb-3 font-semibold">Repuestos</th>
                          <th className="pb-3 font-semibold text-right">Total Cotizado</th>
                          <th className="pb-3 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {quotes
                          .filter((q) => q.status !== "CONVERTIDA")
                          .map((q) => (
                          <tr key={q.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 font-mono font-bold text-[#22D3EE]">
                              COT-{q.consecutive}
                            </td>
                            <td className="py-3 font-medium text-white">
                              {q.customer?.name}
                            </td>
                            <td className="py-3 text-xs">
                              <span className="font-mono bg-white/[0.06] px-2 py-0.5 rounded text-white font-bold">
                                {q.motorcycle?.plate || "S/P"}
                              </span>{" "}
                              <span className="text-[#9CA3AF]">{q.motorcycle?.model}</span>
                            </td>
                            <td className="py-3 text-xs text-[#9CA3AF]">
                              {q.items?.length} repuestos
                            </td>
                            <td className="py-3 text-right font-bold text-white tabular-nums">
                              ${q.total.toLocaleString("es-CO")} COP
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handlePrintQuoteTicket(q)}
                                  className="h-8 text-xs cursor-pointer"
                                  title="Imprimir ticket térmico de esta cotización"
                                >
                                  <Printer className="w-3.5 h-3.5 mr-1 text-[#22D3EE]" />
                                  Ticket
                                </Button>

                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setQuoteToConvert(q);
                                    setConvertPaymentType("EFECTIVO");
                                  }}
                                  className="h-8 text-xs bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40 hover:bg-[#34D399] hover:text-black font-semibold cursor-pointer"
                                  title="Convertir esta cotización en una venta oficial con factura"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                                  Pasar a Venta
                                </Button>

                                <Button
                                  variant="danger"
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => setQuoteToDelete(q)}
                                  className="h-8 px-2 bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white cursor-pointer"
                                  title="Eliminar cotización"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 5. MÓDULO PUNTO DE VENTA (POS) */}
          {activeTab === "Punto de Venta (POS)" && (
            <SalesView
              invoices={invoices}
              onNewSale={() => setIsSaleModalOpen(true)}
              onPrintInvoice={handlePrintInvoiceTicket}
              userRole={user.role}
              onDeleteInvoice={async (invoiceId) => {
                const res = await fetch(`/api/sales/${invoiceId}`, { method: "DELETE" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setNotificationMsg({ type: "success", text: data.message });
                await loadAllData();
              }}
            />
          )}

          {/* 6. MÓDULO CRÉDITOS & CARTERA */}
          {activeTab === "Créditos" && (
            <CreditsView
              credits={credits}
              onRefresh={loadAllData}
              workshopConfig={workshopConfig}
              onOpenTicket={(ticket) => setActiveTicketData(ticket)}
              userRole={user.role}
            />
          )}

          {/* 7. MÓDULO CONTABILIDAD & CAJA */}
          {activeTab === "Contabilidad & Caja" && (
            <CashAccountingView
              invoices={invoices}
              credits={credits}
              dashboardData={dashboardData}
              onPrintTicket={handlePrintInvoiceTicket}
            />
          )}

          {/* 8. MÓDULO AUDITORÍA DE SEGURIDAD */}
          {activeTab === "Auditoría de Seguridad" && <AuditView />}

          {/* 9. MÓDULO CONFIGURACIÓN */}
          {activeTab === "Configuración" && (
            <SettingsView user={user} onRefreshGlobal={loadAllData} />
          )}
        </div>
      </main>

      {/* Modal Cámara Global para Escanear Código de Barras desde Teléfono */}
      <CameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={(barcode) => {
          setLastScanned(barcode);
          setQuickSearch(barcode);
          navigateToTab("Inventario & Kardex");
        }}
        title="Escanear Repuesto con Cámara del Celular"
      />
    </div>
  );
}
