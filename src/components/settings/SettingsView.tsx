"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Settings,
  Save,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image,
  Trash2,
  Printer,
  Copy,
  Lock,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Pencil,
  Receipt,
  Clock,
} from "lucide-react";
import { TicketModal, TicketData } from "@/components/common/TicketModal";

interface SettingsViewProps {
  user: any;
  onRefreshGlobal?: () => void;
}

export function SettingsView({ user, onRefreshGlobal }: SettingsViewProps) {
  const isSuper = user?.role === "SUPERADMIN";

  // Pestañas de configuración
  const [activeTab, setActiveTab] = useState<"TALLER" | "USUARIOS" | "PERMISOS" | "LIMPIEZA">("TALLER");

  // Configuración general
  const [config, setConfig] = useState<any>({
    name: "MotoTaller TS7",
    slogan: "",
    nit: "",
    phone: "",
    address: "",
    logoUrl: "",
    receiptMessage: "",
    roleModulePermissions: {
      ADMIN: {
        "Dashboard": true,
        "Inventario & Kardex": true,
        "Punto de Venta (POS)": true,
        "Órdenes de Trabajo": true,
        "Cotizaciones": true,
        "Créditos": true,
        "Contabilidad & Caja": true,
        "Configuración": true,
      },
      TRABAJADOR: {
        "Dashboard": true,
        "Inventario & Kardex": true,
        "Punto de Venta (POS)": true,
        "Órdenes de Trabajo": true,
        "Cotizaciones": true,
        "Créditos": false,
        "Contabilidad & Caja": false,
        "Configuración": false,
      },
    },
    roleFeaturePermissions: {
      ADMIN: {
        eliminarRepuestos: true,
        descuentosVentas: true,
        verCostosUtilidad: true,
        arqueoCaja: true,
        escanerCamara: true,
      },
      TRABAJADOR: {
        eliminarRepuestos: false,
        descuentosVentas: true,
        verCostosUtilidad: false,
        arqueoCaja: false,
        escanerCamara: true,
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isTicketPreviewOpen, setIsTicketPreviewOpen] = useState(false);

  // Estados de gestión de usuarios (Solo Superadmin)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TRABAJADOR",
  });
  const [userToEdit, setUserToEdit] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
    newPassword?: string;
  } | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Estados de Limpieza y Restablecimiento del Sistema (Solo Superadmin)
  const [resetScope, setResetScope] = useState<"SALES_AND_CREDITS" | "ORDERS_AND_QUOTES" | "ALL">("SALES_AND_CREDITS");
  const [resetStockToZero, setResetStockToZero] = useState(false);
  const [confirmationCodeInput, setConfirmationCodeInput] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  };

  const loadUsers = async () => {
    if (!isSuper) return;
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    }
  };

  useEffect(() => {
    loadSettings();
    if (isSuper) {
      loadUsers();
    }
  }, [isSuper]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: "error", text: "La imagen no debe superar los 2MB de tamaño." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setConfig((prev: any) => ({ ...prev, logoUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "¡Datos del taller guardados exitosamente!" });
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al guardar configuración" });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleModulePermissions: config.roleModulePermissions,
          roleFeaturePermissions: config.roleFeaturePermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({
        type: "success",
        text: "¡Permisos de módulos y funcionalidades actualizados para todos los roles!",
      });
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al guardar permisos" });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleUpdatePassword = async (userId: string) => {
    if (!newPasswordInput.trim()) {
      setMsg({ type: "error", text: "Por favor escribe una nueva contraseña." });
      return;
    }

    setUserActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Contraseña actualizada exitosamente." });
      setSelectedUserForEdit(null);
      setNewPasswordInput("");
      await loadUsers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al actualizar contraseña" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Usuario creado exitosamente." });
      setIsCreateUserOpen(false);
      setNewUserData({ name: "", email: "", password: "", role: "TRABAJADOR" });
      await loadUsers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al crear usuario" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleOpenEditUser = (u: any) => {
    setUserToEdit({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password: u.password,
      newPassword: "",
    });
    setIsEditUserOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setUserActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/users/${userToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userToEdit.name,
          email: userToEdit.email,
          role: userToEdit.role,
          newPassword: userToEdit.newPassword ? userToEdit.newPassword.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Usuario modificado exitosamente." });
      setIsEditUserOpen(false);
      setUserToEdit(null);
      await loadUsers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al modificar usuario" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setUserActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Usuario eliminado exitosamente." });
      setUserToDelete(null);
      await loadUsers();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al eliminar usuario" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const toggleModule = (role: "ADMIN" | "TRABAJADOR", moduleKey: string) => {
    setConfig((prev: any) => {
      const currentRoleMods = prev.roleModulePermissions?.[role] || {};
      return {
        ...prev,
        roleModulePermissions: {
          ...prev.roleModulePermissions,
          [role]: {
            ...currentRoleMods,
            [moduleKey]: !currentRoleMods[moduleKey],
          },
        },
      };
    });
  };

  const toggleFeature = (role: "ADMIN" | "TRABAJADOR", featureKey: string) => {
    setConfig((prev: any) => {
      const currentRoleFeats = prev.roleFeaturePermissions?.[role] || {};
      return {
        ...prev,
        roleFeaturePermissions: {
          ...prev.roleFeaturePermissions,
          [role]: {
            ...currentRoleFeats,
            [featureKey]: !currentRoleFeats[featureKey],
          },
        },
      };
    });
  };

  const sampleTicketData: TicketData = {
    type: "VENTA",
    consecutive: "1001",
    date: new Date().toLocaleString("es-CO"),
    customerName: "Carlos Mendoza (Ejemplo)",
    customerPhone: "300 123 4567",
    plate: "ABC12D",
    motoModel: "Bajaj Boxer CT 100",
    paymentType: "EFECTIVO",
    items: [
      { name: "Kit de Arrastre Boxer CT 100 428H", quantity: 1, unitPrice: 65000, total: 65000 },
      { name: "Aceite Motul 3000 4T 20W50 Mineral 1L", quantity: 1, unitPrice: 35000, total: 35000 },
      { name: "Bujía NGK C7HSA", quantity: 1, unitPrice: 13000, total: 13000 },
    ],
    total: 113000,
    workshopConfig: config,
  };

  const availableModulesList = [
    { key: "Dashboard", label: "Dashboard (Métricas y KPIs)" },
    { key: "Inventario & Kardex", label: "Inventario & Kardex" },
    { key: "Punto de Venta (POS)", label: "Punto de Venta (POS)" },
    { key: "Órdenes de Trabajo", label: "Órdenes de Trabajo (Motos)" },
    { key: "Cotizaciones", label: "Cotizaciones" },
    { key: "Créditos", label: "Módulo de Créditos y Cartera" },
    { key: "Contabilidad & Caja", label: "Contabilidad & Caja Diaria" },
    { key: "Configuración", label: "Menú de Configuración" },
  ];

  const availableFeaturesList = [
    { key: "eliminarRepuestos", label: "Eliminar artículos del inventario" },
    { key: "descuentosVentas", label: "Dar descuentos a la factura o repuestos" },
    { key: "verCostosUtilidad", label: "Ver costos de compra y utilidades netas" },
    { key: "arqueoCaja", label: "Consultar arqueo de caja e historial por calendario" },
    { key: "escanerCamara", label: "Utilizar cámara del celular como escáner" },
  ];

  return (
    <div className="space-y-4">
      {/* Alerta de Notificación */}
      {msg && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
            msg.type === "success"
              ? "bg-[#34D399]/15 border-[#34D399]/40 text-[#34D399]"
              : "bg-red-500/15 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selector de Pestañas (Solo visible si es SUPERADMIN) */}
      {isSuper && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab("TALLER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "TALLER"
                ? "bg-[#5AA9E6] text-black shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Datos del Negocio & Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("USUARIOS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "USUARIOS"
                ? "bg-[#5AA9E6] text-black shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gestión de Usuarios & Contraseñas</span>
            <Badge variant="primary" className="text-[10px] py-0 px-1.5">
              {usersList.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PERMISOS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "PERMISOS"
                ? "bg-[#5AA9E6] text-black shadow-sm"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Control de Módulos & Permisos por Rol</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LIMPIEZA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "LIMPIEZA"
                ? "bg-[#F87171] text-white shadow-sm"
                : "text-[#F87171]/80 hover:text-[#F87171] hover:bg-[#F87171]/10"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpieza de Pruebas & Restablecimiento</span>
          </button>
        </div>
      )}

      {/* PESTAÑA 1: DATOS DEL TALLER & TICKETS */}
      {activeTab === "TALLER" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#5AA9E6]" />
                  Información Comercial del Taller
                </CardTitle>
                <CardDescription className="text-xs">
                  Estos datos se reflejan en el sistema, facturas electrónicas y tickets impresos para los clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveWorkshop} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#94A3B8] block">
                        Nombre del Taller / Negocio
                      </label>
                      <Input
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        placeholder="Ej. MotoTaller TS7"
                        required
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#94A3B8] block">
                        NIT / RUT / Cédula
                      </label>
                      <Input
                        value={config.nit}
                        onChange={(e) => setConfig({ ...config, nit: e.target.value })}
                        placeholder="Ej. 901.452.889-1"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#94A3B8] block">
                      Eslogan o Subtítulo
                    </label>
                    <Input
                      value={config.slogan}
                      onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                      placeholder="Ej. Expertos en Reparación y Repuestos Multimarca"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#94A3B8] block">
                        Teléfono / WhatsApp de Contacto
                      </label>
                      <Input
                        value={config.phone}
                        onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                        placeholder="Ej. (+57) 300 123 4567"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#94A3B8] block">
                        Dirección Física
                      </label>
                      <Input
                        value={config.address}
                        onChange={(e) => setConfig({ ...config, address: e.target.value })}
                        placeholder="Ej. Calle 16 # 10-45"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#94A3B8] block">
                      Mensaje de Pie de Página en Tickets
                    </label>
                    <textarea
                      value={config.receiptMessage}
                      onChange={(e) => setConfig({ ...config, receiptMessage: e.target.value })}
                      placeholder="Texto de agradecimiento, garantía o recomendaciones en el ticket impreso..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs text-[#EAF4F4] bg-[#222831]/60 border border-[#5AA9E6]/25 rounded-xl focus:outline-none focus:border-[#5AA9E6] focus:ring-1 focus:ring-[#5AA9E6]/40"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={loading} variant="primary" size="sm">
                      <Save className="w-3.5 h-3.5 mr-1" />
                      {loading ? "Guardando..." : "Guardar Información"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Logotipo del Taller & Vista Previa */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-4 h-4 text-[#5AA9E6]" />
                  Logotipo del Taller
                </CardTitle>
                <CardDescription className="text-xs">
                  Foto o logo que aparecerá en el menú lateral y en los comprobantes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-[#5AA9E6]/30 rounded-xl bg-white/[0.01]">
                  {config.logoUrl ? (
                    <div className="relative group text-center space-y-2">
                      <img
                        src={config.logoUrl}
                        alt="Logo Actual"
                        className="max-h-24 max-w-full rounded-lg object-contain bg-white/5 p-1 border border-white/20 mx-auto"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setConfig({ ...config, logoUrl: "" })}
                        className="text-xs h-7"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Quitar Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#5AA9E6]/10 text-[#5AA9E6] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-[#94A3B8]">Sin logo cargado</p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 text-xs font-semibold text-[#5AA9E6] hover:bg-[#5AA9E6]/30 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Subir Imagen
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsTicketPreviewOpen(true)}
                  className="w-full text-xs h-8"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-[#5AA9E6]" />
                  Ver Ejemplo de Ticket Térmico
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GESTIÓN DE USUARIOS & CONTRASEÑAS (SOLO SUPERADMIN) */}
      {isSuper && activeTab === "USUARIOS" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#5AA9E6]" />
                  Usuarios Registrados y Credenciales del Sistema
                </CardTitle>
                <CardDescription className="text-xs">
                  Consulta de contraseñas por si a algún empleado o dueño se le olvida, o actualización directa de claves.
                </CardDescription>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateUserOpen(true)}
                className="text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Crear Nuevo Usuario
              </Button>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase text-[#94A3B8] border-b border-white/[0.08]">
                    <tr>
                      <th className="pb-2.5 font-semibold">Nombre de Usuario</th>
                      <th className="pb-2.5 font-semibold">Correo de Ingreso</th>
                      <th className="pb-2.5 font-semibold">Rol Asignado</th>
                      <th className="pb-2.5 font-semibold">Contraseña Actual</th>
                      <th className="pb-2.5 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {usersList.map((u) => {
                      const isRevealed = Boolean(visiblePasswords[u.id]);
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 font-medium text-white">
                            {u.name}
                          </td>
                          <td className="py-2.5 text-[#94A3B8] font-mono">
                            {u.email}
                          </td>
                          <td className="py-2.5">
                            <Badge
                              variant={
                                u.role === "SUPERADMIN"
                                  ? "info"
                                  : u.role === "ADMIN"
                                  ? "primary"
                                  : "neutral"
                              }
                              className="text-[10px] py-0.5 px-2 font-mono"
                            >
                              {u.role === "SUPERADMIN"
                                ? "SUPER USUARIO"
                                : u.role === "ADMIN"
                                ? "DUEÑO (ADMIN)"
                                : "TRABAJADOR"}
                            </Badge>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono text-xs px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] ${
                                  isRevealed ? "text-[#34D399] font-bold" : "text-[#94A3B8]"
                                }`}
                              >
                                {isRevealed ? u.password : "••••••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(u.id)}
                                className="p-1 rounded text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
                                title={isRevealed ? "Ocultar" : "Mostrar contraseña"}
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5 text-[#5AA9E6]" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenEditUser(u)}
                                className="h-7 text-[11px] px-2.5 cursor-pointer hover:bg-[#5AA9E6]/20 hover:text-[#5AA9E6]"
                                title="Modificar nombre, correo, rol o contraseña"
                              >
                                <Pencil className="w-3 h-3 mr-1 text-[#5AA9E6]" />
                                Modificar
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setUserToDelete(u)}
                                disabled={u.email === "super@mototaller.co" || u.id === user?.id}
                                className="h-7 text-[11px] px-2 cursor-pointer bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30 disabled:opacity-25 disabled:cursor-not-allowed"
                                title={
                                  u.email === "super@mototaller.co" || u.id === user?.id
                                    ? "No puedes eliminar tu propia cuenta de Super Usuario activa"
                                    : "Eliminar este usuario definitivamente"
                                }
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PESTAÑA 3: CONTROL DE MÓDULOS & FUNCIONALIDADES POR ROL (SOLO SUPERADMIN) */}
      {isSuper && activeTab === "PERMISOS" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5AA9E6]" />
                  Habilitar / Deshabilitar Módulos y Funcionalidades por Rol
                </CardTitle>
                <CardDescription className="text-xs">
                  Control total: activa o desactiva qué secciones y botones puede ver y usar cada tipo de usuario en el taller.
                </CardDescription>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePermissions}
                disabled={loading}
                className="text-xs font-semibold"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {loading ? "Guardando..." : "Guardar Permisos"}
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 1. Módulos Visibles en el Menú */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#5AA9E6] uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  1. Acceso a Módulos (Pestañas del Menú Lateral)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Rol Dueño */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <span className="font-bold text-xs text-white">Rol: DUEÑO (ADMIN)</span>
                      <Badge variant="primary" className="text-[10px]">Administrador</Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {availableModulesList.map((mod) => {
                        const isEnabled = Boolean(
                          config.roleModulePermissions?.ADMIN?.[mod.key] ?? true
                        );
                        return (
                          <div
                            key={mod.key}
                            className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.02]"
                          >
                            <span className="text-[#94A3B8]">{mod.label}</span>
                            <button
                              type="button"
                              onClick={() => toggleModule("ADMIN", mod.key)}
                              className={`p-1 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                                isEnabled
                                  ? "text-[#34D399]"
                                  : "text-red-400 opacity-60"
                              }`}
                            >
                              {isEnabled ? (
                                <>
                                  <ToggleRight className="w-5 h-5 text-[#34D399]" />
                                  <span>Habilitado</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                                  <span>Oculto</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rol Trabajador */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                      <span className="font-bold text-xs text-white">Rol: TRABAJADOR (Operador)</span>
                      <Badge variant="neutral" className="text-[10px]">Operador</Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {availableModulesList.map((mod) => {
                        const isEnabled = Boolean(
                          config.roleModulePermissions?.TRABAJADOR?.[mod.key] ?? false
                        );
                        return (
                          <div
                            key={mod.key}
                            className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.02]"
                          >
                            <span className="text-[#94A3B8]">{mod.label}</span>
                            <button
                              type="button"
                              onClick={() => toggleModule("TRABAJADOR", mod.key)}
                              className={`p-1 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                                isEnabled
                                  ? "text-[#34D399]"
                                  : "text-red-400 opacity-60"
                              }`}
                            >
                              {isEnabled ? (
                                <>
                                  <ToggleRight className="w-5 h-5 text-[#34D399]" />
                                  <span>Habilitado</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                                  <span>Oculto</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Funcionalidades Específicas */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <h4 className="text-xs font-bold text-[#5AA9E6] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  2. Funcionalidades Específicas Habilitadas
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Funcionalidades Dueño */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="font-bold text-xs text-white border-b border-white/[0.06] pb-2">
                      Acciones para Dueño (ADMIN)
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {availableFeaturesList.map((feat) => {
                        const isEnabled = Boolean(
                          config.roleFeaturePermissions?.ADMIN?.[feat.key] ?? true
                        );
                        return (
                          <div
                            key={feat.key}
                            className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.02]"
                          >
                            <span className="text-[#94A3B8]">{feat.label}</span>
                            <button
                              type="button"
                              onClick={() => toggleFeature("ADMIN", feat.key)}
                              className={`p-1 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                                isEnabled ? "text-[#34D399]" : "text-red-400 opacity-60"
                              }`}
                            >
                              {isEnabled ? (
                                <>
                                  <ToggleRight className="w-5 h-5 text-[#34D399]" />
                                  <span>Activo</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                                  <span>Bloqueado</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Funcionalidades Trabajador */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                    <div className="font-bold text-xs text-white border-b border-white/[0.06] pb-2">
                      Acciones para Trabajador (TRABAJADOR)
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {availableFeaturesList.map((feat) => {
                        const isEnabled = Boolean(
                          config.roleFeaturePermissions?.TRABAJADOR?.[feat.key] ?? false
                        );
                        return (
                          <div
                            key={feat.key}
                            className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.02]"
                          >
                            <span className="text-[#94A3B8]">{feat.label}</span>
                            <button
                              type="button"
                              onClick={() => toggleFeature("TRABAJADOR", feat.key)}
                              className={`p-1 rounded cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                                isEnabled ? "text-[#34D399]" : "text-red-400 opacity-60"
                              }`}
                            >
                              {isEnabled ? (
                                <>
                                  <ToggleRight className="w-5 h-5 text-[#34D399]" />
                                  <span>Activo</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                                  <span>Bloqueado</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSavePermissions}
                  disabled={loading}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {loading ? "Guardando..." : "Guardar Todos los Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PESTAÑA 4: LIMPIEZA DE PRUEBAS & RESTABLECIMIENTO PARA ENTREGA (SOLO SUPERADMIN) */}
      {isSuper && activeTab === "LIMPIEZA" && (
        <div className="space-y-4">
          <Card className="border-[#F87171]/40 bg-[#222831]">
            <CardHeader className="pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F87171]/20 border border-[#F87171]/40 flex items-center justify-center text-[#F87171]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">
                    Limpieza de Pruebas y Restablecimiento para Entrega
                  </CardTitle>
                  <CardDescription className="text-xs text-[#94A3B8]">
                    Herramienta maestra para vaciar transacciones ficticias o de prueba y dejar el sistema en blanco y listo para entregar al cliente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-5">
              <div className="p-3.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 text-xs text-[#EAF4F4] space-y-1.5">
                <div className="font-bold text-[#F87171] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  ADVERTENCIA DE SEGURIDAD
                </div>
                <p>
                  Esta herramienta elimina permanentemente los registros seleccionados. Tus cuentas de usuarios, repuestos catalogados y configuraciones comerciales no se borrarán a menos que tú lo indiques explícitamente.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">
                  Selecciona qué deseas vaciar o limpiar:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div
                    onClick={() => setResetScope("SALES_AND_CREDITS")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      resetScope === "SALES_AND_CREDITS"
                        ? "bg-[#5AA9E6]/15 border-[#5AA9E6] text-white shadow-lg shadow-[#5AA9E6]/10"
                        : "bg-white/[0.02] border-white/[0.08] text-[#94A3B8] hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-[#5AA9E6]" />
                      Solo Ventas y Deudas
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Borra todas las facturas de prueba, cartera de créditos y abonos registrados. El inventario se conserva.
                    </p>
                  </div>

                  <div
                    onClick={() => setResetScope("ORDERS_AND_QUOTES")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      resetScope === "ORDERS_AND_QUOTES"
                        ? "bg-[#5AA9E6]/15 border-[#5AA9E6] text-white shadow-lg shadow-[#5AA9E6]/10"
                        : "bg-white/[0.02] border-white/[0.08] text-[#94A3B8] hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#22D3EE]" />
                      Órdenes y Cotizaciones
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Limpia órdenes de trabajo abiertas o cerradas y cotizaciones creadas durante las pruebas de taller.
                    </p>
                  </div>

                  <div
                    onClick={() => setResetScope("ALL")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      resetScope === "ALL"
                        ? "bg-[#F87171]/15 border-[#F87171] text-white shadow-lg shadow-[#F87171]/10"
                        : "bg-white/[0.02] border-white/[0.08] text-[#94A3B8] hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-[#F87171] mb-1 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" />
                      Limpieza Total (Cero Km)
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Vacía todas las ventas, abonos, órdenes, cotizaciones y movimientos de kardex para entrega final.
                    </p>
                  </div>
                </div>

                {resetScope === "ALL" && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                      <input
                        type="checkbox"
                        checked={resetStockToZero}
                        onChange={(e) => setResetStockToZero(e.target.checked)}
                        className="rounded border-white/20 text-[#F87171] focus:ring-[#F87171] cursor-pointer"
                      />
                      <span className="text-xs text-[#EAF4F4]">
                        Reiniciar también el stock actual de todos los repuestos a <b className="text-white">0 unidades</b> (Mantiene los repuestos creados listos para el conteo físico inicial).
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">
                  Se requerirá una clave de confirmación antes de ejecutar la limpieza.
                </span>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setConfirmationCodeInput("");
                    setIsResetConfirmModalOpen(true);
                  }}
                  className="bg-[#F87171] hover:bg-[#EF4444] text-white font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Proceder con la Limpieza
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Confirmación de Limpieza del Sistema */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#222831] border border-[#F87171]/50 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F87171]/20 border border-[#F87171]/40 text-[#F87171] flex items-center justify-center mx-auto shadow-lg shadow-[#F87171]/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Confirmar Limpieza de Datos
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Ámbito seleccionado:{" "}
                <b className="text-white">
                  {resetScope === "SALES_AND_CREDITS"
                    ? "Ventas, Deudas y Abonos"
                    : resetScope === "ORDERS_AND_QUOTES"
                    ? "Órdenes y Cotizaciones"
                    : "Limpieza Total del Sistema"}
                </b>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left text-xs text-[#EAF4F4] space-y-2">
              <p className="font-semibold text-white">
                Para confirmar la eliminación permanente, escribe el siguiente código exacto:
              </p>
              <div className="p-2 rounded bg-black/40 font-mono text-center text-[#F87171] font-bold tracking-wider select-all">
                LIMPIAR-SISTEMA-2026
              </div>
              <Input
                type="text"
                value={confirmationCodeInput}
                onChange={(e) => setConfirmationCodeInput(e.target.value.trim().toUpperCase())}
                placeholder="Escribe el código aquí..."
                className="h-9 text-xs font-mono text-center tracking-wider uppercase"
              />
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={resetLoading}
                onClick={() => setIsResetConfirmModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={resetLoading || confirmationCodeInput !== "LIMPIAR-SISTEMA-2026"}
                onClick={async () => {
                  setResetLoading(true);
                  try {
                    const res = await fetch("/api/system/reset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        scope: resetScope,
                        confirmationCode: confirmationCodeInput,
                        resetStockToZero,
                      }),
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);

                    setMsg({ type: "success", text: data.message });
                    setIsResetConfirmModalOpen(false);
                    if (onRefreshGlobal) {
                      onRefreshGlobal();
                    }
                  } catch (err: any) {
                    setMsg({ type: "error", text: err.message || "Error al limpiar el sistema" });
                  } finally {
                    setResetLoading(false);
                  }
                }}
                className="bg-[#F87171] hover:bg-[#EF4444] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Limpiando Datos..." : "Confirmar y Ejecutar Limpieza"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Contraseña de Usuario */}
      {selectedUserForEdit && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUserForEdit(null);
          }}
        >
          <div className="w-full max-w-sm bg-[#222831] border border-[#5AA9E6]/40 rounded-2xl shadow-2xl p-5 text-[#EAF4F4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#5AA9E6]" />
                Actualizar Contraseña
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#94A3B8]">
              Usuario: <b className="text-white">{selectedUserForEdit.name}</b> ({selectedUserForEdit.email})
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8] block">
                Nueva Contraseña
              </label>
              <Input
                type="text"
                placeholder="Escribe la nueva contraseña..."
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUserForEdit(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={userActionLoading || !newPasswordInput.trim()}
                onClick={() => handleUpdatePassword(selectedUserForEdit.id)}
              >
                {userActionLoading ? "Actualizando..." : "Guardar Nueva Clave"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nuevo Usuario */}
      {isCreateUserOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateUserOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[#222831] border border-[#5AA9E6]/40 rounded-2xl shadow-2xl p-5 text-[#EAF4F4] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#5AA9E6]" />
                Registrar Nuevo Usuario en el Sistema
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateUserOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Nombre Completo
                </label>
                <Input
                  required
                  placeholder="Ej. Juan Pérez"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Correo Electrónico (Para iniciar sesión)
                </label>
                <Input
                  required
                  type="email"
                  placeholder="usuario@mototaller.co"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Contraseña Inicial
                </label>
                <Input
                  required
                  type="text"
                  placeholder="Mínimo 6 caracteres..."
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Rol en el Sistema
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs text-[#EAF4F4] bg-[#222831]/80 border border-[#5AA9E6]/30 rounded-xl focus:outline-none focus:border-[#5AA9E6]"
                >
                  <option value="TRABAJADOR">Trabajador (Operador)</option>
                  <option value="ADMIN">Dueño (Administrador del Taller)</option>
                  <option value="SUPERADMIN">Super Usuario (Control Total)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateUserOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={userActionLoading}>
                  {userActionLoading ? "Registrando..." : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Modificar Usuario */}
      {isEditUserOpen && userToEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222831] border border-[#5AA9E6]/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#5AA9E6]" />
                Modificar Usuario: {userToEdit.name}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsEditUserOpen(false);
                  setUserToEdit(null);
                }}
                className="text-[#94A3B8] hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Nombre Completo
                </label>
                <Input
                  required
                  placeholder="Ej. Juan Pérez"
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Correo Electrónico de Ingreso
                </label>
                <Input
                  required
                  type="email"
                  placeholder="usuario@mototaller.co"
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Rol en el Sistema
                </label>
                <select
                  value={userToEdit.role}
                  onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs text-[#EAF4F4] bg-[#222831]/80 border border-[#5AA9E6]/30 rounded-xl focus:outline-none focus:border-[#5AA9E6]"
                >
                  <option value="TRABAJADOR">Trabajador (Operador)</option>
                  <option value="ADMIN">Dueño (Administrador del Taller)</option>
                  <option value="SUPERADMIN">Super Usuario (Control Total)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#94A3B8]">
                    Nueva Contraseña
                  </label>
                  <span className="text-[10px] text-[#94A3B8]/80">Opcional</span>
                </div>
                <Input
                  type="text"
                  placeholder="Dejar vacío si no deseas cambiarla..."
                  value={userToEdit.newPassword || ""}
                  onChange={(e) => setUserToEdit({ ...userToEdit, newPassword: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
                <p className="text-[10px] text-[#94A3B8] mt-0.5">
                  Contraseña actual: <span className="font-mono text-[#34D399] font-semibold">{userToEdit.password}</span>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsEditUserOpen(false);
                    setUserToEdit(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={userActionLoading}>
                  {userActionLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Confirmar Eliminación de Usuario */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222831] border border-[#F87171]/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#F87171]">
              <div className="w-10 h-10 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#F87171]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Eliminar Usuario</h4>
                <p className="text-xs text-[#94A3B8]">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-xs text-[#EAF4F4] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente al usuario{" "}
              <strong className="text-white font-bold">{userToDelete.name}</strong>{" "}
              (<span className="font-mono text-[#5AA9E6]">{userToDelete.email}</span>)?
              Se revocarán todas sus sesiones activas de inmediato.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setUserToDelete(null)}
                disabled={userActionLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteUser}
                disabled={userActionLoading}
                className="bg-[#F87171] hover:bg-[#EF4444] text-white"
              >
                {userActionLoading ? "Eliminando..." : "Eliminar Definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ejemplo de Ticket Impreso */}
      <TicketModal
        isOpen={isTicketPreviewOpen}
        onClose={() => setIsTicketPreviewOpen(false)}
        data={sampleTicketData}
      />
    </div>
  );
}
