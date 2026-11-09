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
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  PackageCheck,
  ArrowRight,
  Smartphone,
  Download,
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
import { playScanBeep } from "@/lib/sound";

const TAB_TO_PATH: Record<string, string> = {
  "Dashboard": "/dashboard",
  "Inventario & Kardex": "/inventario",
  "Bajo Stock": "/bajo-stock",
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
  "/bajo-stock": "Bajo Stock",
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

const getCategoryDisplayName = (cat: any): string => {
  if (!cat) return "General";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object" && cat.name) return String(cat.name);
  return "General";
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
  const [productToSale, setProductToSale] = useState<any | null>(null);
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

  // Estados del Módulo de Bajo Stock & Pedidos Rápidos
  const [lowStockSearch, setLowStockSearch] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState<"TODOS" | "AGOTADOS" | "BAJO">("TODOS");
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [quickStockUpdating, setQuickStockUpdating] = useState<string | null>(null);
  const [copiedToWhatsApp, setCopiedToWhatsApp] = useState(false);

  // Multi-Empresa (Soporte para múltiples microempresas: Talleres de motos, tiendas, minimarkets)
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("comp-mototaller");

  // 1. Verificar sesión con timeout ultrarrápido para móviles (400ms)
  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setCheckingAuth(false);
    }, 400);

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.user) {
          setUser(data.user);
          if (data.user.role !== "SUPERADMIN") {
            setSelectedCompanyId(data.user.companyId || "comp-mototaller");
          } else if (data.user.companyId && data.user.companyId !== "ALL") {
            setSelectedCompanyId(data.user.companyId);
          } else {
            setSelectedCompanyId("comp-mototaller");
          }
          if (data.companies) {
            setAvailableCompanies(data.companies);
          }
        }
      })
      .catch((err) => {
        // En conexiones iniciales o sin sesión, proceder de inmediato al login
        console.info("Auth check completado:", err?.message || err);
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
        if (user.role !== "SUPERADMIN") {
          setSelectedCompanyId(user.companyId || "comp-mototaller");
        }
      }
    } catch (e) {
      console.error("Error al cargar datos:", e);
    } finally {
      setLoading(false);
    }
  };

  // Validación y reconciliación de empresa seleccionada
  useEffect(() => {
    if (availableCompanies.length > 0) {
      if (user?.role !== "SUPERADMIN") {
        setSelectedCompanyId(user?.companyId || "comp-mototaller");
      } else {
        const exists = selectedCompanyId === "ALL" || availableCompanies.some((c) => c.id === selectedCompanyId);
        if (!exists) {
          setSelectedCompanyId(availableCompanies[0]?.id || "comp-mototaller");
        }
      }
    }
  }, [availableCompanies, user, selectedCompanyId]);

  // Empresa activa actual calculada con paleta de colores personalizada
  const activeCompany = useMemo(() => {
    if (selectedCompanyId && selectedCompanyId !== "ALL") {
      const found = availableCompanies.find((c) => c.id === selectedCompanyId);
      if (found) {
        return {
          ...found,
          primaryColor: found.primaryColor || "#5AA9E6",
          secondaryColor: found.secondaryColor || "#1F3A5F",
        };
      }
    }
    if (user?.company) {
      return {
        ...user.company,
        primaryColor: user.company.primaryColor || "#5AA9E6",
        secondaryColor: user.company.secondaryColor || "#1F3A5F",
      };
    }
    if (availableCompanies.length > 0) {
      return {
        ...availableCompanies[0],
        primaryColor: availableCompanies[0].primaryColor || "#5AA9E6",
        secondaryColor: availableCompanies[0].secondaryColor || "#1F3A5F",
      };
    }
    return {
      id: "comp-mototaller",
      name: workshopConfig?.name || "MotoTaller TS7",
      type: "TALLER_MOTOS" as const,
      slogan: workshopConfig?.slogan || "Especialistas en Reparación y Repuestos Multimarca",
      nit: workshopConfig?.nit || "901.452.889-1",
      phone: workshopConfig?.phone || "(+57) 300 123 4567",
      address: workshopConfig?.address || "Calle 16 # 10-45, Maicao, La Guajira",
      receiptMessage: workshopConfig?.receiptMessage || "¡Gracias por su compra!",
      logoUrl: workshopConfig?.logoUrl || "",
      primaryColor: workshopConfig?.primaryColor || "#5AA9E6",
      secondaryColor: workshopConfig?.secondaryColor || "#1F3A5F",
    };
  }, [selectedCompanyId, availableCompanies, user, workshopConfig]);

  // Solo es taller de motos si la empresa seleccionada es explícitamente TALLER_MOTOS
  const isWorkshop = selectedCompanyId === "ALL" ? false : activeCompany.type === "TALLER_MOTOS";

  // Actualizar el título de la pestaña del navegador con el nombre de la empresa activa
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!user) {
        document.title = "Acceso al Sistema · Sistema de Gestión Comercial & POS";
      } else if (selectedCompanyId === "ALL") {
        document.title = "Todas las Empresas · Sistema POS";
      } else if (activeCompany?.name) {
        document.title = `${activeCompany.name} · Sistema de Gestión POS`;
      } else {
        document.title = "Sistema de Gestión Comercial & POS";
      }
    }
  }, [user, activeCompany?.name, selectedCompanyId]);

  // Aislamiento Multi-Empresa: Filtrado de datos por empresa activa
  const filteredInvoices = useMemo(() => {
    if (selectedCompanyId === "ALL") return invoices;
    return invoices.filter((i) => (i.companyId || "comp-mototaller") === selectedCompanyId);
  }, [invoices, selectedCompanyId]);

  const companyProducts = useMemo(() => {
    if (selectedCompanyId === "ALL") return products;
    return products.filter((p) => (p.companyId || "comp-mototaller") === selectedCompanyId);
  }, [products, selectedCompanyId]);

  // Artículos con bajo stock para la empresa activa
  const lowStockProducts = useMemo(() => {
    return companyProducts.filter((p) => p.currentStock <= p.minStock);
  }, [companyProducts]);

  const outOfStockCount = useMemo(() => {
    return lowStockProducts.filter((p) => p.currentStock === 0).length;
  }, [lowStockProducts]);

  const getSuggestedUnits = (p: any) => {
    if (orderQuantities[p.id] !== undefined) return orderQuantities[p.id];
    return Math.max(1, p.minStock * 2 - p.currentStock);
  };

  const totalSuggestedUnits = useMemo(() => {
    return lowStockProducts.reduce((sum, p) => sum + getSuggestedUnits(p), 0);
  }, [lowStockProducts, orderQuantities]);

  const totalEstimatedInvestment = useMemo(() => {
    return lowStockProducts.reduce((sum, p) => sum + getSuggestedUnits(p) * (p.costPrice || 0), 0);
  }, [lowStockProducts, orderQuantities]);

  const filteredOrders = useMemo(() => {
    if (!isWorkshop) return [];
    if (selectedCompanyId === "ALL") return workOrders;
    return workOrders.filter((o) => (o.companyId || "comp-mototaller") === selectedCompanyId);
  }, [workOrders, selectedCompanyId, isWorkshop]);

  const filteredQuotes = useMemo(() => {
    if (selectedCompanyId === "ALL") return quotes;
    return quotes.filter((q) => (q.companyId || "comp-mototaller") === selectedCompanyId);
  }, [quotes, selectedCompanyId]);

  const filteredCredits = useMemo(() => {
    if (selectedCompanyId === "ALL") return credits;
    return credits.filter((c) => (c.companyId || "comp-mototaller") === selectedCompanyId);
  }, [credits, selectedCompanyId]);

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

  // 3. Pistola Láser y Lector Inteligente de Códigos de Barras
  const isAnySubModalOpen =
    isSaleModalOpen ||
    isOrderModalOpen ||
    isProductModalOpen ||
    isQuoteModalOpen ||
    isCameraScannerOpen;

  const handleGlobalBarcodeScan = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    setLastScanned(cleanCode);

    // Buscar el producto en la empresa activa primero, o en el catálogo global
    const found =
      companyProducts.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
          p.sku.toLowerCase() === cleanCode.toLowerCase()
      ) ||
      products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
          p.sku.toLowerCase() === cleanCode.toLowerCase()
      );

    // CASO 1: Si estamos en "Punto de Venta (POS)"
    if (activeTab === "Punto de Venta (POS)") {
      if (found) {
        // Iniciar venta de inmediato con el producto cargado en el carrito
        setProductToSale(found);
        setIsSaleModalOpen(true);
        playScanBeep(true);
        setNotificationMsg({
          type: "success",
          text: `"${found.name}" agregado a la venta.`,
        });
      } else {
        // Si no existe, notificar y permitir registrarlo
        playScanBeep(false);
        setNotificationMsg({
          type: "error",
          text: `El código "${cleanCode}" no está registrado en el inventario.`,
        });
        setLastScanned(cleanCode);
        setIsProductModalOpen(true);
      }
      return;
    }

    // CASO 2: Si estamos en "Inventario & Kardex" o "Bajo Stock"
    if (activeTab === "Inventario & Kardex" || activeTab === "Bajo Stock") {
      if (found) {
        // El producto ya existe: ubicarlo y filtrarlo en la tabla sin abrir el modal de crear producto
        setQuickSearch(found.barcode || found.sku || cleanCode);
        playScanBeep(true);
        setNotificationMsg({
          type: "success",
          text: `Producto encontrado: "${found.name}" (Stock: ${found.currentStock} unidades | Ubicación: ${found.location || "Sin estante"}).`,
        });
      } else {
        // No existe en inventario: abrir modal para agregarlo
        playScanBeep(false);
        setLastScanned(cleanCode);
        setIsProductModalOpen(true);
        setNotificationMsg({
          type: "error",
          text: `Código nuevo "${cleanCode}". Ingresa los datos del nuevo producto.`,
        });
      }
      return;
    }

    // CASO 3: En cualquier otra vista (Dashboard, etc.)
    if (found) {
      // Iniciar venta directa
      setProductToSale(found);
      setIsSaleModalOpen(true);
      playScanBeep(true);
      setNotificationMsg({
        type: "success",
        text: `Iniciando venta para "${found.name}".`,
      });
    } else {
      setLastScanned(cleanCode);
      setIsProductModalOpen(true);
    }
  };

  useBarcodeScanner({
    enabled: !!user && !isAnySubModalOpen,
    onScan: (code) => {
      handleGlobalBarcodeScan(code);
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
    const invDiscount = Number(inv.discount) || 0;
    const invSubtotal = Number(inv.subtotal) || (Number(inv.total) + invDiscount);

    const ticketData: TicketData = {
      type: "VENTA",
      consecutive: inv.consecutive,
      date: new Date(inv.createdAt || Date.now()).toLocaleString("es-CO"),
      customerName: inv.customer?.name || "Consumidor Final",
      customerPhone: inv.customer?.phone || undefined,
      paymentType: inv.paymentType || "EFECTIVO",
      items: (inv.items || []).map((i: any) => {
        const prodSalePrice = i.product?.salePrice;
        const regPrice = i.regularPrice || (prodSalePrice && prodSalePrice > i.unitPrice ? prodSalePrice : undefined);
        return {
          name: i.product?.name || i.description || "Repuesto",
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          regularPrice: regPrice,
          discount: i.discount || (regPrice ? Math.max(0, regPrice - i.unitPrice) * i.quantity : 0),
          total: i.totalPrice || i.unitPrice * i.quantity,
        };
      }),
      subtotal: invSubtotal,
      discount: invDiscount,
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

  const filteredProducts = useMemo(() => {
    return companyProducts.filter((prod) => {
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
  }, [companyProducts, motorcycleFilter]);

  // Copiar lista de pedido formateada para WhatsApp
  const handleCopyWhatsAppOrder = () => {
    if (lowStockProducts.length === 0) return;
    const dateStr = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
    let msg = `📦 *ORDEN DE PEDIDO / REPOSICIÓN DE MERCANCÍA*\n`;
    msg += `🏢 Negocio: *${activeCompany.name}*\n`;
    if (activeCompany.nit) msg += `📄 NIT / ID: ${activeCompany.nit}\n`;
    if (activeCompany.phone) msg += `📞 Contacto: ${activeCompany.phone}\n`;
    msg += `📅 Fecha: ${dateStr}\n`;
    msg += `-------------------------------------------\n`;
    msg += `*LISTA DE ARTÍCULOS A PEDIR:*\n\n`;

    lowStockProducts.forEach((p, idx) => {
      const qty = getSuggestedUnits(p);
      msg += `${idx + 1}. *${p.name}*\n`;
      if (p.sku) msg += `   • Código/SKU: ${p.sku}\n`;
      const catName = getCategoryDisplayName(p.category);
      if (catName && catName !== "General") msg += `   • Categoría: ${catName}\n`;
      msg += `   • Stock actual: ${p.currentStock} (Mínimo: ${p.minStock})\n`;
      msg += `   • 👉 *CANTIDAD SOLICITADA: ${qty} unidades*\n\n`;
    });

    msg += `-------------------------------------------\n`;
    msg += `📊 *TOTALES DEL PEDIDO:*\n`;
    msg += `• Artículos por reponer: ${lowStockProducts.length}\n`;
    msg += `• Unidades totales a pedir: ${totalSuggestedUnits}\n`;
    if (totalEstimatedInvestment > 0) {
      msg += `• Inversión estimada costo: $${totalEstimatedInvestment.toLocaleString("es-CO")} COP\n`;
    }
    msg += `\n_Generado automáticamente desde el Sistema POS & Gestión Comercial._`;

    navigator.clipboard.writeText(msg).then(() => {
      setCopiedToWhatsApp(true);
      setNotificationMsg({
        type: "success",
        text: "¡Lista de pedido copiada! Puedes pegarla directamente en WhatsApp a tu proveedor.",
      });
      setTimeout(() => setCopiedToWhatsApp(false), 3500);
    });
  };

  // Ajuste rápido de stock al recibir mercancía de proveedores
  const handleQuickAddStock = async (productId: string, addQty: number) => {
    setQuickStockUpdating(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addStock: addQty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotificationMsg({
        type: "success",
        text: `¡Stock actualizado exitosamente (+${addQty} unidades)!`,
      });
      await loadAllData();
    } catch (err: any) {
      setNotificationMsg({
        type: "error",
        text: err.message || "Error al actualizar stock",
      });
    } finally {
      setQuickStockUpdating(null);
    }
  };

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
      { label: "Inventario & Kardex", icon: Package, badge: `${filteredProducts.length}` },
      {
        label: "Bajo Stock",
        icon: AlertTriangle,
        badge: lowStockProducts.length > 0 ? `${lowStockProducts.length}` : undefined,
        isAlert: lowStockProducts.length > 0,
      },
      {
        label: "Punto de Venta (POS)",
        icon: ShoppingCart,
      },
      {
        label: "Órdenes de Trabajo",
        icon: ClipboardList,
        badge: filteredOrders.filter((o) => o.status !== "ENTREGADA_Y_FACTURADA").length > 0
          ? `${filteredOrders.filter((o) => o.status !== "ENTREGADA_Y_FACTURADA").length}`
          : undefined,
      },
      {
        label: "Cotizaciones",
        icon: FileText,
        badge: filteredQuotes.length > 0 ? `${filteredQuotes.length}` : undefined,
      },
      {
        label: "Créditos",
        icon: CreditCard,
        badge: filteredCredits.filter((c) => c.status !== "PAGADO").length > 0
          ? `${filteredCredits.filter((c) => c.status !== "PAGADO").length}`
          : undefined,
      },
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
  }, [user, filteredProducts.length, filteredInvoices.length, filteredOrders, filteredQuotes.length, filteredCredits, workshopConfig, isWorkshop, activeCompany]);

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
    return (
      <LoginForm
        onLoginSuccess={(u) => {
          setUser(u);
          if (u.role !== "SUPERADMIN") {
            setSelectedCompanyId(u.companyId || "comp-mototaller");
          } else {
            setSelectedCompanyId(u.companyId || "comp-mototaller");
          }
        }}
      />
    );
  }

  const kpis = [
    {
      title: "Ventas de Hoy",
      value: `$${filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toLocaleString("es-CO")} COP`,
      change: filteredInvoices.length === 1 ? "1 factura" : `${filteredInvoices.length} facturas`,
      isUp: true,
      icon: ShoppingCart,
    },
    {
      title: "Utilidad Estimada",
      value: `$${Math.round(filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0) * 0.35).toLocaleString("es-CO")} COP`,
      change: "margen neto",
      isUp: true,
      icon: TrendingUp,
    },
    {
      title: isWorkshop ? "Motos en Taller" : "Artículos en Tienda",
      value: isWorkshop
        ? `${filteredOrders.filter((o) => o.status !== "ENTREGADA_Y_FACTURADA").length} activas`
        : `${filteredProducts.length} productos`,
      change: isWorkshop ? `${filteredOrders.length} totales` : "en inventario",
      isUp: true,
      icon: isWorkshop ? ClipboardList : Package,
    },
    {
      title: isWorkshop ? "Cotizaciones" : "Ventas Mostrador",
      value: isWorkshop ? `${filteredQuotes.length} realizadas` : `${filteredInvoices.length} emitidas`,
      change: isWorkshop ? "estimaciones" : "tickets",
      isUp: true,
      icon: isWorkshop ? Calculator : ShoppingCart,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Modales */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        initialBarcode={lastScanned || ""}
        companyId={selectedCompanyId !== "ALL" ? selectedCompanyId : (user.companyId || "comp-mototaller")}
        companyName={activeCompany?.name}
        companyType={activeCompany?.type}
        onClose={() => {
          setIsProductModalOpen(false);
          setLastScanned(null);
        }}
        onProductCreated={loadAllData}
      />

      <CreateWorkOrderModal
        isOpen={isOrderModalOpen}
        products={companyProducts}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderCreated={loadAllData}
      />

      <CreateSaleModal
        isOpen={isSaleModalOpen}
        products={filteredProducts}
        companyId={selectedCompanyId !== "ALL" ? selectedCompanyId : (user.companyId || "comp-mototaller")}
        initialProduct={productToSale}
        onClose={() => {
          setIsSaleModalOpen(false);
          setProductToSale(null);
        }}
        onSaleCreated={(createdInvoice) => {
          loadAllData();
          setProductToSale(null);
          if (createdInvoice) {
            handlePrintInvoiceTicket(createdInvoice);
          }
        }}
      />

      <CreateQuoteModal
        isOpen={isQuoteModalOpen}
        products={companyProducts}
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
        userRole={user?.role}
        companyId={activeCompany?.id || selectedCompanyId || user?.companyId}
        onSavePrintConfig={async (compId, printConfig) => {
          try {
            const res = await fetch(`/api/companies/${compId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ printConfig }),
            });
            if (res.ok) {
              await loadAllData();
            }
          } catch (err) {
            console.error("Error guardando calibración de empresa:", err);
          }
        }}
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

              {/* Botón de Instalación PWA en Móvil */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  localStorage.removeItem("pos_pwa_dismissed");
                  window.dispatchEvent(new CustomEvent("open-pwa-guide"));
                }}
                className="w-full mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#1F3A5F]/70 to-[#5AA9E6]/20 border border-[#5AA9E6]/40 text-[#5AA9E6] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#1F3A5F]/30"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#5AA9E6]" />
                  <span>Instalar App en Celular</span>
                </div>
                <Download className="w-3.5 h-3.5" />
              </button>
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
                {activeCompany?.slogan || (isWorkshop ? "Repuestos & Taller" : activeCompany?.type === "FERRETERIA" ? "Ferretería & Construcción" : activeCompany?.type === "TIENDA_COMERCIO" ? "Tienda & Abarrotes" : "Comercio & Ventas")}
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer text-left ${
                    active
                      ? "text-white font-semibold shadow-sm"
                      : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"
                  }`}
                  style={{
                    backgroundColor: active ? `${activeCompany.primaryColor || "#5AA9E6"}22` : undefined,
                    borderColor: active ? `${activeCompany.primaryColor || "#5AA9E6"}55` : "transparent",
                    borderWidth: 1,
                    color: active ? (activeCompany.primaryColor || "#5AA9E6") : undefined,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.isAlert ? "warning" : active ? "primary" : "neutral"}
                      className={`text-[10px] py-0 px-1.5 ${
                        item.isAlert
                          ? "bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse font-bold"
                          : ""
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección inferior del Sidebar: Perfil */}
        <div className="space-y-2">

          {/* Perfil del usuario activo y Salir */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
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
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Topbar alineado perfectamente con los recuadros de abajo */}
        <div className="px-3 sm:px-6 pt-3 sm:pt-4 sticky top-0 z-20 w-full">
          <header className="h-12 border border-white/[0.12] rounded-2xl px-3 sm:px-5 flex items-center justify-between glass gap-2 sm:gap-3 shadow-lg shadow-black/30">
            {/* Botón Menú Móvil */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-[#9CA3AF] hover:text-white p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[140px] xs:max-w-[170px] sm:max-w-xs">
                <Input
                  icon={<Search className="w-3.5 h-3.5 shrink-0" />}
                  placeholder={isWorkshop ? "Buscar repuesto, placa, SKU..." : "Buscar producto, código, SKU..."}
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="h-7.5 text-xs w-full"
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
                    <option value="ALL" className="bg-[#222831] text-white">
                      🏢 Todas las Empresas ({products.length} artículos)
                    </option>
                    {availableCompanies.map((c) => {
                      const count = products.filter((p) => (p.companyId || "comp-mototaller") === c.id).length;
                      return (
                        <option key={c.id} value={c.id} className="bg-[#222831] text-white">
                          {c.type === "TALLER_MOTOS" ? "🏍️ " : c.type === "FERRETERIA" ? "🔨 " : "🏪 "} {c.name} ({count} {c.type === "TALLER_MOTOS" ? "repuestos" : "artículos"})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <span className="text-xs">{activeCompany.type === "TALLER_MOTOS" ? "🏍️" : activeCompany.type === "FERRETERIA" ? "🔨" : "🏪"}</span>
                  <span className="text-xs text-white font-semibold truncate max-w-[160px]">
                    {activeCompany.name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsQuoteModalOpen(true)}
                className="h-7.5 px-2 sm:px-2.5 text-xs font-semibold cursor-pointer"
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
                  className="h-7.5 px-2 sm:px-2.5 text-xs font-semibold cursor-pointer"
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
                className="h-7.5 px-2.5 sm:px-3 text-xs font-bold cursor-pointer"
                title="Facturar venta en mostrador (POS)"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Nueva Venta</span>
              </Button>
            </div>
          </header>
        </div>

        {/* Contenido Separado por Módulos (Alineado pixel a pixel con el topbar) */}
        <div className="px-4 sm:px-6 pt-4 pb-8 space-y-4 w-full">
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
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-[family-name:var(--font-space-grotesk)]">
                {activeTab}
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {activeTab === "Dashboard" && (isWorkshop ? "Métricas y resumen general de operaciones de tu almacén de repuestos." : `Métricas y resumen general de operaciones de ${activeCompany.name}.`)}
                {activeTab === "Inventario & Kardex" && (isWorkshop ? "Control de repuestos, stock mínimo y ubicación física en estantes." : `Control de inventario, stock mínimo y precios de venta de ${activeCompany.name}.`)}
                {activeTab === "Bajo Stock" && `Monitorea existencias críticas de ${activeCompany.name}, calcula reposición de faltantes y genera pedidos para WhatsApp.`}
                {activeTab === "Punto de Venta (POS)" && "Facturación rápida en mostrador con desglose por días y calendario."}
                {activeTab === "Órdenes de Trabajo" && "Motos y clientes: asigna o retira repuestos entregados a cada vehículo en tiempo real."}
                {activeTab === "Cotizaciones" && (isWorkshop ? "Calcula cuánto se llevará en repuestos una moto para el cliente." : "Genera cotizaciones y presupuestos formales para tus clientes.")}
                {activeTab === "Créditos" && "Control de ventas a crédito, abonos de clientes y saldos pendientes."}
                {activeTab === "Contabilidad & Caja" && "Flujo de caja, arqueo diario y balance financiero real."}
                {activeTab === "Auditoría de Seguridad" && "Registro inmutable de seguridad de todas las operaciones del sistema."}
                {activeTab === "Configuración" && "Ajusta datos del negocio, NIT, teléfono, usuarios y copias de seguridad."}
              </p>
            </div>

            {activeTab === "Punto de Venta (POS)" && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsCameraScannerOpen(true)}>
                  <Camera className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                  Escanear con Cámara
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsSaleModalOpen(true)}>
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                  Nueva Venta
                </Button>
              </div>
            )}
            {activeTab === "Inventario & Kardex" && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsCameraScannerOpen(true)}>
                  <Camera className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                  Escanear con Cámara
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsProductModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {isWorkshop ? "Nuevo Repuesto" : "Nuevo Producto"}
                </Button>
              </div>
            )}
            {activeTab === "Bajo Stock" && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  className="cursor-pointer font-medium text-xs h-8"
                  title="Imprimir hoja de pedido para distribuidores"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                  <span>Imprimir Lista</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyWhatsAppOrder}
                  disabled={lowStockProducts.length === 0}
                  className="cursor-pointer font-bold text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                  title="Copiar pedido formateado para enviar a proveedores"
                >
                  {copiedToWhatsApp ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>¡Copiado a WhatsApp!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>Copiar Pedido a WhatsApp</span>
                    </>
                  )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                    </div>
                  </Card>
                ))}
              </div>

              {/* Accesos Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card className="hover:border-[#5AA9E6]/40 cursor-pointer" onClick={() => setIsSaleModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#5AA9E6]/20 text-[#5AA9E6] shrink-0">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base">Facturar en Mostrador</h4>
                      <p className="text-xs text-[#9CA3AF]">Cobra repuestos y descuenta stock</p>
                    </div>
                  </div>
                </Card>

                <Card className="hover:border-[#22D3EE]/40 cursor-pointer" onClick={() => setIsOrderModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base">Asignar Repuestos a Moto</h4>
                      <p className="text-xs text-[#9CA3AF]">Abre orden y entrega piezas</p>
                    </div>
                  </div>
                </Card>

                <Card className="hover:border-[#34D399]/40 cursor-pointer" onClick={() => setIsQuoteModalOpen(true)}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#34D399]/20 text-[#34D399] shrink-0">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm sm:text-base">Hacer Cotización</h4>
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
                  <CardTitle>{isWorkshop ? "Listado de Repuestos & Ubicaciones Físicas" : "Catálogo de Productos & Ubicaciones"}</CardTitle>
                  <CardDescription>
                    {isWorkshop
                      ? `Catálogo de repuestos con estantería física (${companyProducts.length} productos registrados).`
                      : `Catálogo general de inventario de ${activeCompany.name} (${companyProducts.length} productos registrados).`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros rápidos por motocicleta (Solo visibles si es taller de motos) */}
                {isWorkshop && (
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
                )}

                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Package className="w-10 h-10 text-[#9CA3AF] mx-auto opacity-50" />
                    <p className="text-sm font-semibold text-white">
                      Esta empresa ({activeCompany.name}) no tiene artículos en su inventario.
                    </p>
                    <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                      Comienza agregando productos a tu catálogo para registrar stock, precios de venta y facturar en el punto de venta.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setIsProductModalOpen(true)}
                        className="cursor-pointer font-bold"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Producto a {activeCompany.name}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase text-[#9CA3AF] border-b border-white/[0.08]">
                        <tr>
                          <th className="pb-3 font-semibold">{isWorkshop ? "SKU / Repuesto" : "Código / Producto"}</th>
                          <th className="pb-3 font-semibold whitespace-nowrap min-w-[180px]">Ubicación Física</th>
                          <th className="pb-3 font-semibold">Stock Actual</th>
                          <th className="pb-3 font-semibold">Precio Venta</th>
                          <th className="pb-3 font-semibold">{isWorkshop ? "Compatibilidad" : "Categoría / Detalle"}</th>
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
                                  {isLow && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigateToTab("Bajo Stock");
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold cursor-pointer transition-all shadow-sm hover:scale-105"
                                      title="Ir al módulo de Bajo Stock para generar pedido a proveedor"
                                    >
                                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                                      <span>Bajo Stock · Reponer →</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 tabular-nums font-semibold text-white">
                                ${prod.salePrice.toLocaleString("es-CO")} COP
                              </td>
                              <td className="py-3.5 text-xs text-[#9CA3AF]">
                                {prod.motorcycleFit || (isWorkshop ? "Universal" : "General")}
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

          {/* 2.5 MÓDULO EXCLUSIVO DE BAJO STOCK & PEDIDOS RÁPIDOS A PROVEEDORES */}
          {activeTab === "Bajo Stock" && (
            <div className="space-y-4">
              {/* 4 KPIs de Resumen de Pedidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-3.5 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Artículos Bajo Stock</p>
                      <p className="text-2xl font-bold text-amber-300 mt-0.5 tabular-nums">{lowStockProducts.length}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-2">
                    Productos con stock ≤ mínimo establecido
                  </p>
                </Card>

                <Card className="p-3.5 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Agotados Críticos (0)</p>
                      <p className="text-2xl font-bold text-red-400 mt-0.5 tabular-nums">{outOfStockCount}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-2">
                    Sin existencias disponibles en almacén
                  </p>
                </Card>

                <Card className="p-3.5 bg-gradient-to-br from-[#5AA9E6]/10 to-transparent border-[#5AA9E6]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Total Unidades a Pedir</p>
                      <p className="text-2xl font-bold text-[#5AA9E6] mt-0.5 tabular-nums">{totalSuggestedUnits}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-[#5AA9E6]/15 border border-[#5AA9E6]/30 flex items-center justify-center text-[#5AA9E6] shrink-0">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-2">
                    Sugerido para restablecer inventario
                  </p>
                </Card>

                <Card className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Inversión Costo Estimada</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5 tabular-nums truncate">
                        ${totalEstimatedInvestment.toLocaleString("es-CO")}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-2">
                    Calculado a precio de costo de compra
                  </p>
                </Card>
              </div>

              {/* Tarjeta Principal de la Tabla de Bajo Stock */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Lista de Artículos para Reposición & Pedidos a Proveedores
                    </CardTitle>
                    <CardDescription>
                      Ajusta las cantidades requeridas y copia la orden completa directamente a WhatsApp con un solo clic.
                    </CardDescription>
                  </div>

                  {/* Barra de Filtros y Búsqueda */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="w-48 sm:w-56">
                      <Input
                        icon={<Search className="w-3.5 h-3.5 text-[#5AA9E6]" />}
                        placeholder="Buscar por nombre, SKU..."
                        value={lowStockSearch}
                        onChange={(e) => setLowStockSearch(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setLowStockFilter("TODOS")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                          lowStockFilter === "TODOS"
                            ? "bg-[#5AA9E6] text-white"
                            : "text-[#9CA3AF] hover:text-white"
                        }`}
                      >
                        Todos ({lowStockProducts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLowStockFilter("AGOTADOS")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                          lowStockFilter === "AGOTADOS"
                            ? "bg-red-500 text-white"
                            : "text-[#9CA3AF] hover:text-white"
                        }`}
                      >
                        Agotados ({outOfStockCount})
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {(() => {
                    const displayItems = lowStockProducts.filter((p) => {
                      const catName = getCategoryDisplayName(p.category);
                      const matchesQuery =
                        !lowStockSearch ||
                        p.name.toLowerCase().includes(lowStockSearch.toLowerCase()) ||
                        (p.sku && p.sku.toLowerCase().includes(lowStockSearch.toLowerCase())) ||
                        catName.toLowerCase().includes(lowStockSearch.toLowerCase());

                      if (!matchesQuery) return false;
                      if (lowStockFilter === "AGOTADOS") return p.currentStock === 0;
                      return true;
                    });

                    if (displayItems.length === 0) {
                      return (
                        <div className="py-12 text-center space-y-3">
                          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
                          <h4 className="text-base font-bold text-white">
                            {lowStockProducts.length === 0
                              ? `¡Todo en orden! ${activeCompany.name} no tiene artículos con bajo stock.`
                              : "No hay artículos que coincidan con la búsqueda."}
                          </h4>
                          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                            {lowStockProducts.length === 0
                              ? "Todas las existencias se encuentran por encima del stock mínimo establecido. Puedes continuar vendiendo con normalidad."
                              : "Intenta cambiar el término de búsqueda o el filtro seleccionado arriba."}
                          </p>
                          {lowStockProducts.length === 0 && (
                            <div className="pt-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigateToTab("Inventario & Kardex")}
                                className="cursor-pointer font-semibold"
                              >
                                <Package className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                                Ver Catálogo Completo
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs uppercase text-[#9CA3AF] border-b border-white/[0.08]">
                            <tr>
                              <th className="py-3 px-1 font-semibold">Producto / Referencia</th>
                              <th className="py-3 font-semibold">Stock Actual</th>
                              <th className="py-3 font-semibold">Mínimo</th>
                              <th className="py-3 font-semibold">Estado</th>
                              <th className="py-3 font-semibold text-center">Unidades a Pedir</th>
                              <th className="py-3 font-semibold">Costo Unit.</th>
                              <th className="py-3 font-semibold">Subtotal Sugerido</th>
                              <th className="py-3 font-semibold text-right">Recepción Rápida</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {displayItems.map((prod) => {
                              const isOut = prod.currentStock === 0;
                              const suggested = getSuggestedUnits(prod);
                              const subtotal = suggested * (prod.costPrice || 0);
                              const stockPct = prod.minStock > 0 ? Math.min(100, Math.round((prod.currentStock / prod.minStock) * 100)) : 0;

                              return (
                                <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3.5 px-1">
                                    <div className="font-semibold text-white leading-tight">{prod.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mt-0.5">
                                      <span className="font-mono text-[11px] text-[#5AA9E6]">SKU: {prod.sku || "N/A"}</span>
                                      <span>•</span>
                                      <span className="text-[11px]">{getCategoryDisplayName(prod.category)}</span>
                                    </div>
                                  </td>

                                  <td className="py-3.5">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold tabular-nums text-sm ${isOut ? "text-red-400" : "text-amber-300"}`}>
                                        {prod.currentStock} uds
                                      </span>
                                    </div>
                                    {/* Barra de progreso de nivel de stock */}
                                    <div className="w-24 h-1.5 rounded-full bg-white/[0.08] mt-1 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${isOut ? "bg-red-500" : "bg-amber-400"}`}
                                        style={{ width: `${Math.max(5, stockPct)}%` }}
                                      />
                                    </div>
                                  </td>

                                  <td className="py-3.5 tabular-nums text-xs text-[#9CA3AF]">
                                    {prod.minStock} uds
                                  </td>

                                  <td className="py-3.5">
                                    {isOut ? (
                                      <Badge variant="danger" className="text-[10px] font-bold">
                                        AGOTADO (0)
                                      </Badge>
                                    ) : (
                                      <Badge variant="warning" className="text-[10px] font-bold">
                                        BAJO STOCK
                                      </Badge>
                                    )}
                                  </td>

                                  {/* Cantidad sugerida con botones + y - interactivos */}
                                  <td className="py-3.5">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = suggested;
                                          if (current > 1) {
                                            setOrderQuantities({ ...orderQuantities, [prod.id]: current - 1 });
                                          }
                                        }}
                                        className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                                        title="Disminuir unidad a pedir"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min="1"
                                        value={suggested}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 1;
                                          setOrderQuantities({ ...orderQuantities, [prod.id]: Math.max(1, val) });
                                        }}
                                        className="w-14 h-7 text-center text-xs font-bold font-mono text-white bg-[#1a1d28] border border-white/[0.12] rounded-md focus:outline-none focus:border-[#5AA9E6]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = suggested;
                                          setOrderQuantities({ ...orderQuantities, [prod.id]: current + 1 });
                                        }}
                                        className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                                        title="Aumentar unidad a pedir"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  <td className="py-3.5 tabular-nums text-xs text-[#9CA3AF]">
                                    ${(prod.costPrice || 0).toLocaleString("es-CO")} COP
                                  </td>

                                  <td className="py-3.5 tabular-nums font-semibold text-emerald-400 text-xs">
                                    ${subtotal.toLocaleString("es-CO")} COP
                                  </td>

                                  {/* Botones de recepción rápida cuando llega mercancía */}
                                  <td className="py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <span className="text-[10px] text-[#94A3B8] hidden xl:inline mr-1">Llegó:</span>
                                      <button
                                        type="button"
                                        disabled={quickStockUpdating === prod.id}
                                        onClick={() => handleQuickAddStock(prod.id, 5)}
                                        className="px-2 py-1 rounded bg-[#5AA9E6]/15 hover:bg-[#5AA9E6]/25 text-[#5AA9E6] border border-[#5AA9E6]/30 text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                                        title="Sumar 5 unidades al inventario"
                                      >
                                        +5
                                      </button>
                                      <button
                                        type="button"
                                        disabled={quickStockUpdating === prod.id}
                                        onClick={() => handleQuickAddStock(prod.id, 10)}
                                        className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                                        title="Sumar 10 unidades al inventario"
                                      >
                                        +10
                                      </button>
                                      <button
                                        type="button"
                                        disabled={quickStockUpdating === prod.id}
                                        onClick={() => handleQuickAddStock(prod.id, suggested)}
                                        className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/20 text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
                                        title={`Sumar las ${suggested} unidades solicitadas al inventario`}
                                      >
                                        +{suggested} (Todo)
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
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
                {filteredOrders.filter((ord) => ord.status !== "ENTREGADA_Y_FACTURADA").length === 0 ? (
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
                    {filteredOrders
                      .filter((ord) => ord.status !== "ENTREGADA_Y_FACTURADA")
                      .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#5AA9E6]/40 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-lg text-[#5AA9E6]">
                                #{ord.consecutive}
                              </span>
                              <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-white/[0.08] text-white text-xs">
                                {ord.motorcycle?.plate}
                              </span>
                              <span className="text-sm font-medium text-white truncate max-w-[200px]">
                                {ord.motorcycle?.model}
                              </span>
                              <Badge variant="info">{ord.status}</Badge>
                            </div>
                            <p className="text-xs text-[#9CA3AF] mt-1 truncate">
                              Cliente: <b className="text-white">{ord.customer?.name}</b> · Tel: {ord.customer?.phone || "Sin teléfono"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                            <span className="text-xs text-[#9CA3AF] block">Total Orden:</span>
                            <span className="text-lg sm:text-xl font-bold text-white tabular-nums">
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
                {filteredQuotes.filter((q) => q.status !== "CONVERTIDA").length === 0 ? (
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
                        {filteredQuotes
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
              invoices={filteredInvoices}
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
              credits={filteredCredits}
              onRefresh={loadAllData}
              workshopConfig={activeCompany || workshopConfig}
              onOpenTicket={(ticket) => setActiveTicketData(ticket)}
              userRole={user.role}
            />
          )}

          {/* 7. MÓDULO CONTABILIDAD & CAJA */}
          {activeTab === "Contabilidad & Caja" && (
            <CashAccountingView
              invoices={filteredInvoices}
              credits={filteredCredits}
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
          handleGlobalBarcodeScan(barcode);
        }}
        title={
          activeTab === "Punto de Venta (POS)"
            ? "Escanear Producto para Venta"
            : isWorkshop
            ? "Escanear Repuesto con Cámara del Celular"
            : "Escanear Producto con Cámara del Celular"
        }
      />
    </div>
  );
}
