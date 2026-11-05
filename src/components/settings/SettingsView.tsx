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
  Building2,
  Store,
  Wrench,
  Database,
  Download,
  RefreshCw,
  FileArchive,
  Shield,
  HardDrive,
  Palette,
  Sparkles,
  ExternalLink,
  Link2,
} from "lucide-react";
import { TicketModal, TicketData } from "@/components/common/TicketModal";

const COLOR_PALETTES = [
  { name: "Azul Cyan Tech", primary: "#5AA9E6", secondary: "#1F3A5F" },
  { name: "Verde Esmeralda", primary: "#10B981", secondary: "#064E3B" },
  { name: "Naranja Ferretería", primary: "#F97316", secondary: "#7C2D12" },
  { name: "Rojo Racing", primary: "#EF4444", secondary: "#7F1D1D" },
  { name: "Púrpura Neón", primary: "#A855F7", secondary: "#581C87" },
  { name: "Ámbar Industrial", primary: "#F59E0B", secondary: "#78350F" },
];

interface SettingsViewProps {
  user: any;
  onRefreshGlobal?: () => void;
}

export function SettingsView({ user, onRefreshGlobal }: SettingsViewProps) {
  const isSuper = user?.role === "SUPERADMIN";

  // Pestañas de configuración
  const [activeTab, setActiveTab] = useState<"EMPRESAS" | "TALLER" | "USUARIOS" | "PERMISOS" | "BACKUPS" | "LIMPIEZA">(
    isSuper ? "EMPRESAS" : "TALLER"
  );

  // Lista de empresas registradas (Multi-Empresa)
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<any | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<any | null>(null);
  const [companyActionLoading, setCompanyActionLoading] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    type: "TALLER_MOTOS",
    slogan: "",
    nit: "",
    phone: "",
    address: "",
    logoUrl: "",
    receiptMessage: "¡Gracias por su compra! Vuelva pronto.",
    primaryColor: "#5AA9E6",
    secondaryColor: "#1F3A5F",
  });

  // Créditos de autor By Breiner Rosellon (Hipervínculo activable desde Superadmin)
  const [authorCredit, setAuthorCredit] = useState({
    enabled: true,
    text: "By Breiner Rosellon",
    url: "https://github.com/rosellonbreiner-lab/POS",
  });
  const [savingAuthorCredit, setSavingAuthorCredit] = useState(false);

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
    companyId: "",
  });
  const [userToEdit, setUserToEdit] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
    newPassword?: string;
    companyId?: string;
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

  // Estados de Copias de Seguridad (Backups Cifrados AES-256)
  const [backupConfig, setBackupConfig] = useState<any>({
    enabled: true,
    intervalHours: 24,
    maxBackupsToKeep: 7,
    lastBackupAt: null,
    nextBackupAt: null,
  });
  const [storedBackups, setStoredBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [savingBackupConfig, setSavingBackupConfig] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState<any | null>(null);
  const [restoreConfirmationCode, setRestoreConfirmationCode] = useState("");
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<any | null>(null);
  const [deletingBackup, setDeletingBackup] = useState(false);

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch("/api/backup");
      const data = await res.json();
      if (data.config) setBackupConfig(data.config);
      if (data.backups) setStoredBackups(data.backups);
    } catch (e) {
      console.error("Error loading backups:", e);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackupNow = async () => {
    setCreatingBackup(true);
    setMsg(null);
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: `¡Copia de seguridad cifrada (${data.backup?.filename}) creada exitosamente!` });
      await loadBackups();
      // Iniciar descarga automáticamente al navegador
      if (data.backup?.filename) {
        window.open(`/api/backup/download?filename=${encodeURIComponent(data.backup.filename)}`, "_blank");
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al crear copia de seguridad." });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleSaveBackupConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBackupConfig(true);
    setMsg(null);
    try {
      const res = await fetch("/api/backup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "¡Preferencias de copias automáticas guardadas exitosamente!" });
      if (data.config) setBackupConfig(data.config);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al guardar configuración de backup." });
    } finally {
      setSavingBackupConfig(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return;
    setDeletingBackup(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/backup?filename=${encodeURIComponent(backupToDelete.filename)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: data.message || "Copia eliminada." });
      setBackupToDelete(null);
      await loadBackups();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al eliminar copia." });
    } finally {
      setDeletingBackup(false);
    }
  };

  const handleExecuteRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restoreConfirmationCode.trim() !== "RESTAURAR-COPIA-2026") {
      setMsg({ type: "error", text: "Código de confirmación incorrecto. Debe escribir 'RESTAURAR-COPIA-2026'." });
      return;
    }

    setRestoringBackup(true);
    setMsg(null);
    try {
      let res;
      if (restoreFile) {
        const formData = new FormData();
        formData.append("file", restoreFile);
        formData.append("confirmationCode", restoreConfirmationCode);
        res = await fetch("/api/backup/restore", {
          method: "POST",
          body: formData,
        });
      } else if (backupToRestore) {
        res = await fetch("/api/backup/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: backupToRestore.filename,
            confirmationCode: restoreConfirmationCode,
          }),
        });
      } else {
        throw new Error("No se ha seleccionado ninguna copia para restaurar.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: `¡${data.message}!` });
      setIsRestoreModalOpen(false);
      setBackupToRestore(null);
      setRestoreFile(null);
      setRestoreConfirmationCode("");
      await loadBackups();
      await loadSettings();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al restaurar copia de seguridad." });
    } finally {
      setRestoringBackup(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.companies) {
        setCompaniesList(data.companies);
        if (!newUserData.companyId && data.companies.length > 0) {
          setNewUserData((prev) => ({ ...prev, companyId: data.companies[0].id }));
        }
      }
    } catch (e) {
      console.error("Error loading companies:", e);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        if (data.config.companies) {
          setCompaniesList(data.config.companies);
        }
        if (data.config.authorCredit) {
          setAuthorCredit(data.config.authorCredit);
        }
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
      if (data.companies) {
        setCompaniesList(data.companies);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    }
  };

  useEffect(() => {
    loadSettings();
    loadCompanies();
    loadBackups();
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

  const handleNewCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: "error", text: "La imagen no debe superar los 2MB de tamaño." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewCompanyData((prev) => ({ ...prev, logoUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: "error", text: "La imagen no debe superar los 2MB de tamaño." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCompanyToEdit((prev: any) => ({ ...prev, logoUrl: base64String }));
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
      setMsg({ type: "success", text: "¡Datos comerciales guardados exitosamente!" });
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

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyData.name.trim() || !newCompanyData.nit.trim()) {
      setMsg({ type: "error", text: "Nombre de empresa y NIT son obligatorios." });
      return;
    }

    setCompanyActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompanyData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Empresa registrada exitosamente." });
      setIsCreateCompanyOpen(false);
      setNewCompanyData({
        name: "",
        type: "TALLER_MOTOS",
        slogan: "",
        nit: "",
        phone: "",
        address: "",
        logoUrl: "",
        receiptMessage: "¡Gracias por su compra! Vuelva pronto.",
        primaryColor: "#5AA9E6",
        secondaryColor: "#1F3A5F",
      });
      await loadCompanies();
      await loadSettings();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al registrar empresa" });
    } finally {
      setCompanyActionLoading(false);
    }
  };

  const handleSaveEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyToEdit) return;

    setCompanyActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/companies/${companyToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyToEdit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Empresa actualizada exitosamente." });
      setIsEditCompanyOpen(false);
      setCompanyToEdit(null);
      await loadCompanies();
      await loadSettings();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al actualizar empresa" });
    } finally {
      setCompanyActionLoading(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    setCompanyActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/companies/${companyToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Empresa eliminada exitosamente." });
      setCompanyToDelete(null);
      await loadCompanies();
      await loadSettings();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al eliminar empresa" });
    } finally {
      setCompanyActionLoading(false);
    }
  };

  const handleSaveAuthorCredit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingAuthorCredit(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorCredit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: "¡Configuración de botón By Breiner Rosellon actualizada exitosamente!" });
      await loadSettings();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Error al guardar créditos de autor" });
    } finally {
      setSavingAuthorCredit(false);
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
        body: JSON.stringify({
          ...newUserData,
          companyId: newUserData.companyId || (companiesList[0]?.id || "comp-mototaller"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg({ type: "success", text: data.message || "Usuario creado exitosamente." });
      setIsCreateUserOpen(false);
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "TRABAJADOR",
        companyId: companiesList[0]?.id || "",
      });
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
      companyId: u.companyId || (companiesList[0]?.id || ""),
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
          companyId: userToEdit.companyId,
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

      {/* Selector de Pestañas (Visible si es SUPERADMIN o ADMIN) */}
      {(isSuper || user?.role === "ADMIN") && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.08]">
          {isSuper && (
            <button
              type="button"
              onClick={() => setActiveTab("EMPRESAS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "EMPRESAS"
                  ? "bg-[#5AA9E6] text-black shadow-sm"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Gestión de Empresas & Negocios</span>
              <Badge variant="primary" className="text-[10px] py-0 px-1.5">
                {companiesList.length}
              </Badge>
            </button>
          )}

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

          {isSuper && (
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
          )}

          {isSuper && (
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
          )}

          <button
            type="button"
            onClick={() => setActiveTab("BACKUPS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "BACKUPS"
                ? "bg-[#5AA9E6] text-black shadow-sm font-bold"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Copias de Seguridad (Backups Cifrados)</span>
            <Badge variant="neutral" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              AES-256
            </Badge>
          </button>

          {isSuper && (
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
          )}
        </div>
      )}

      {/* PESTAÑA 0: GESTIÓN DE EMPRESAS & MICROEMPRESAS (SOLO SUPERADMIN) */}
      {isSuper && activeTab === "EMPRESAS" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#5AA9E6]" />
                  Gestión de Empresas & Microempresas Registradas
                </CardTitle>
                <CardDescription className="text-xs">
                  Crea y administra múltiples negocios (talleres de motos, tiendas comerciales, ferreterías o minimarkets). Cada empresa cuenta con datos independientes, tickets térmicos con su propia razón social y usuarios propios.
                </CardDescription>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateCompanyOpen(true)}
                className="text-xs font-semibold shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nueva Empresa / Negocio
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Resumen de Negocios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Total Negocios</p>
                  <p className="text-xl font-bold text-white mt-1">{companiesList.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Talleres de Motos</p>
                  <p className="text-xl font-bold text-[#5AA9E6] mt-1">
                    {companiesList.filter((c) => c.type === "TALLER_MOTOS").length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Tiendas & Comercios</p>
                  <p className="text-xl font-bold text-[#34D399] mt-1">
                    {companiesList.filter((c) => c.type !== "TALLER_MOTOS").length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">Usuarios Asignados</p>
                  <p className="text-xl font-bold text-[#22D3EE] mt-1">{usersList.length}</p>
                </div>
              </div>

              {/* Grid de Empresas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {companiesList.map((comp) => {
                  const assignedUsers = usersList.filter(
                    (u) => u.companyId === comp.id
                  );
                  const isWorkshop = comp.type === "TALLER_MOTOS";

                  return (
                    <div
                      key={comp.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#5AA9E6]/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {comp.logoUrl ? (
                              <img
                                src={comp.logoUrl}
                                alt={comp.name}
                                className="w-9 h-9 rounded-xl object-contain bg-white/5 border border-white/20 p-0.5 shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                isWorkshop
                                  ? "bg-[#5AA9E6]/15 border-[#5AA9E6]/30 text-[#5AA9E6]"
                                  : "bg-[#34D399]/15 border-[#34D399]/30 text-[#34D399]"
                              }`}>
                                {isWorkshop ? <Wrench className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-white">{comp.name}</h4>
                              <p className="text-[11px] text-[#94A3B8] line-clamp-1">
                                {comp.slogan || "Sin eslogan registrado"}
                              </p>
                            </div>
                          </div>

                          <Badge
                            variant={isWorkshop ? "primary" : "success"}
                            className="text-[10px] font-semibold shrink-0"
                          >
                            {isWorkshop ? "🏍️ Taller de Motos" : "🏪 Tienda / Comercio"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/[0.04]">
                          <div>
                            <span className="text-[10px] text-[#94A3B8] block">NIT / RUT:</span>
                            <span className="font-mono text-white text-[11px]">{comp.nit}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#94A3B8] block">Teléfono:</span>
                            <span className="text-[#EAF4F4] text-[11px]">{comp.phone || "No registrado"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-[#94A3B8] block">Dirección:</span>
                            <span className="text-[#EAF4F4] text-[11px] truncate block">
                              {comp.address || "No registrada"}
                            </span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04] text-[11px] text-[#94A3B8]">
                          <span className="font-semibold text-white block text-[10px]">Mensaje en Ticket:</span>
                          <span className="italic line-clamp-1">"{comp.receiptMessage}"</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#5AA9E6]" />
                            <span>
                              <b>{assignedUsers.length}</b> user(s)
                            </span>
                          </div>

                          {/* Muestra de la paleta de colores */}
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/40 border border-white/[0.06] text-[10px]" title="Paleta de Colores de la Empresa">
                            <span className="text-[#94A3B8]">Paleta:</span>
                            <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: comp.primaryColor || "#5AA9E6" }} title={`Primario: ${comp.primaryColor || "#5AA9E6"}`} />
                            <div className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: comp.secondaryColor || "#1F3A5F" }} title={`Secundario: ${comp.secondaryColor || "#1F3A5F"}`} />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setCompanyToEdit(comp);
                              setIsEditCompanyOpen(true);
                            }}
                            className="h-7 text-[11px] px-2.5 cursor-pointer hover:bg-[#5AA9E6]/20 hover:text-[#5AA9E6]"
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Editar
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCompanyToDelete(comp)}
                            disabled={companiesList.length <= 1}
                            className="h-7 text-[11px] px-2 cursor-pointer bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30 disabled:opacity-20 disabled:cursor-not-allowed"
                            title={companiesList.length <= 1 ? "No puedes eliminar el único negocio" : "Eliminar empresa"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* TARJETA DE CRÉDITOS DE AUTOR: BY BREINER ROSELLON */}
          <Card className="border-[#5AA9E6]/30 bg-gradient-to-br from-[#1F3A5F]/20 via-[#222831]/80 to-[#222831]">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5AA9E6]" />
                    Créditos de Autor & Marca Personal (By Breiner Rosellon)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Controla la visibilidad y destino del botón / hipervínculo en el pie de página del sistema (Login y Barra lateral).
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs font-semibold text-[#94A3B8]">Estado:</label>
                  <button
                    type="button"
                    onClick={() => setAuthorCredit({ ...authorCredit, enabled: !authorCredit.enabled })}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      authorCredit.enabled
                        ? "bg-[#5AA9E6]/20 text-[#5AA9E6] border-[#5AA9E6]/40"
                        : "bg-white/[0.05] text-[#94A3B8] border-white/10"
                    }`}
                  >
                    {authorCredit.enabled ? <ToggleRight className="w-4 h-4 text-[#5AA9E6]" /> : <ToggleLeft className="w-4 h-4 text-[#94A3B8]" />}
                    <span>{authorCredit.enabled ? "Activo (Visible)" : "Desactivado (Oculto)"}</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Texto del Botón / Hipervínculo
                  </label>
                  <Input
                    value={authorCredit.text}
                    onChange={(e) => setAuthorCredit({ ...authorCredit, text: e.target.value })}
                    placeholder="By Breiner Rosellon"
                    className="h-8 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-[#5AA9E6]" />
                    Enlace URL de Destino (Hipervínculo)
                  </label>
                  <Input
                    value={authorCredit.url}
                    onChange={(e) => setAuthorCredit({ ...authorCredit, url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Vista previa interactiva */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#94A3B8]">
                  <span className="font-semibold text-white block">Vista Previa del Botón:</span>
                  <span className="text-[11px]">Haz clic para verificar que el enlace abra correctamente la página web.</span>
                </div>

                <div>
                  {authorCredit.enabled ? (
                    <a
                      href={authorCredit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1F3A5F]/80 hover:bg-[#1F3A5F] border border-[#5AA9E6]/50 text-[#5AA9E6] hover:text-white text-xs font-semibold shadow-lg shadow-[#1F3A5F]/40 transition-all hover:scale-105"
                      title="Probar hipervínculo"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#5AA9E6]" />
                      <span>{authorCredit.text || "By Breiner Rosellon"}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#94A3B8] italic">(Botón oculto actualmente en el sistema)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={savingAuthorCredit}
                  onClick={() => handleSaveAuthorCredit()}
                  className="cursor-pointer font-bold text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {savingAuthorCredit ? "Guardando..." : "Guardar Configuración de Créditos"}
                </Button>
              </div>
            </CardContent>
          </Card>
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
                  Información Comercial de la Empresa / Negocio
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
                        Nombre de la Empresa / Negocio
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

          {/* Columna Derecha: Logotipo de la Empresa & Vista Previa */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-4 h-4 text-[#5AA9E6]" />
                  Logotipo de la Empresa / Negocio
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
                      <th className="pb-2.5 font-semibold">Empresa Asignada</th>
                      <th className="pb-2.5 font-semibold">Rol Asignado</th>
                      <th className="pb-2.5 font-semibold">Contraseña Actual</th>
                      <th className="pb-2.5 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {usersList.map((u) => {
                      const isRevealed = Boolean(visiblePasswords[u.id]);
                      const isWorkshop = u.companyType === "TALLER_MOTOS";

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 font-medium text-white">
                            {u.name}
                          </td>
                          <td className="py-2.5 text-[#94A3B8] font-mono">
                            {u.email}
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">
                                {u.role === "SUPERADMIN"
                                  ? "🌐"
                                  : isWorkshop
                                  ? "🏍️"
                                  : "🏪"}
                              </span>
                              <span className="text-xs text-white font-medium">
                                {u.companyName || "No asignada"}
                              </span>
                            </div>
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

      {/* PESTAÑA: COPIAS DE SEGURIDAD (BACKUPS CIFRADOS) */}
      {activeTab === "BACKUPS" && (
        <div className="space-y-4">
          {/* Tarjeta de Encabezado / Estado de Seguridad */}
          <Card className="border-[#5AA9E6]/30 bg-gradient-to-r from-[#1F3A5F]/40 to-[#222831]">
            <CardHeader className="pb-3 border-b border-white/[0.08]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5AA9E6]/20 border border-[#5AA9E6]/40 flex items-center justify-center text-[#5AA9E6]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base text-white">Copias de Seguridad (Backups Cifrados)</CardTitle>
                      <Badge variant="neutral" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        🔒 AES-256-GCM Activo
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-[#94A3B8]">
                      Cifrado de grado militar con firma de autenticidad. Solo este software puede descifrar y restaurar los datos.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleCreateBackupNow}
                    disabled={creatingBackup}
                    className="cursor-pointer font-bold shadow-lg shadow-[#5AA9E6]/20"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    {creatingBackup ? "Generando y Cifrando..." : "⚡ Generar y Descargar Copia Ahora"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-3 pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[#94A3B8] block text-[11px]">Estado Copias Automáticas</span>
                  <span className="font-bold flex items-center gap-1.5 mt-0.5">
                    {backupConfig.enabled ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Activadas (En Segundo Plano)
                      </span>
                    ) : (
                      <span className="text-amber-400">Pausadas</span>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[#94A3B8] block text-[11px]">Última Copia Realizada</span>
                  <span className="font-mono text-white block mt-0.5">
                    {backupConfig.lastBackupAt
                      ? new Date(backupConfig.lastBackupAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "medium" })
                      : "Sin copias previas"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[#94A3B8] block text-[11px]">Próxima Copia Programada</span>
                  <span className="font-mono text-[#5AA9E6] block mt-0.5">
                    {backupConfig.enabled && backupConfig.nextBackupAt
                      ? new Date(backupConfig.nextBackupAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "medium" })
                      : "Pausada"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Frecuencia Recomendada & Automatización */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-white/[0.08]">
              <CardHeader className="pb-3 border-b border-white/[0.08]">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5AA9E6]" />
                  Frecuencia de Copia Recomendada
                </CardTitle>
                <CardDescription className="text-xs text-[#94A3B8]">
                  Configura con qué frecuencia el sistema generará copias de respaldo automáticas.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <form onSubmit={handleSaveBackupConfig} className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Copia Automática en Segundo Plano
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        El servidor generará el backup sin interrumpir la atención a clientes
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBackupConfig((prev: any) => ({ ...prev, enabled: !prev.enabled }))}
                      className="cursor-pointer"
                    >
                      {backupConfig.enabled ? (
                        <ToggleRight className="w-8 h-8 text-[#5AA9E6]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-[#94A3B8]" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white block">
                      Intervalo de Tiempo Recomendado:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          hours: 24,
                          label: "Cada 24 Horas (Diario)",
                          badge: "⭐ RECOMENDADO",
                          desc: "Ideal para la mayoría de talleres y tiendas",
                        },
                        {
                          hours: 12,
                          label: "Cada 12 Horas",
                          badge: "Alto Flujo",
                          desc: "Para negocios con alta rotación diaria",
                        },
                        {
                          hours: 6,
                          label: "Cada 6 Horas",
                          badge: "Intensivo",
                          desc: "Protección continua ante imprevistos",
                        },
                        {
                          hours: 168,
                          label: "Cada 7 Días (Semanal)",
                          badge: "Semanal",
                          desc: "Para bajo volumen de operaciones",
                        },
                      ].map((item) => (
                        <div
                          key={item.hours}
                          onClick={() => setBackupConfig((prev: any) => ({ ...prev, intervalHours: item.hours }))}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            backupConfig.intervalHours === item.hours
                              ? "bg-[#5AA9E6]/15 border-[#5AA9E6] text-white"
                              : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] text-[#94A3B8]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{item.label}</span>
                            <Badge
                              variant="neutral"
                              className={`text-[9px] px-1 py-0 ${
                                item.hours === 24
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-white/5 text-[#94A3B8] border-white/10"
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-[#94A3B8] block">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#94A3B8] block">
                      Retención de Copias Locales en Servidor
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="3"
                        max="30"
                        value={backupConfig.maxBackupsToKeep || 7}
                        onChange={(e) =>
                          setBackupConfig((prev: any) => ({
                            ...prev,
                            maxBackupsToKeep: Number(e.target.value) || 7,
                          }))
                        }
                        className="h-8 text-xs w-28"
                      />
                      <span className="text-xs text-[#94A3B8]">
                        copias más recientes (elimina las anteriores para no saturar disco)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={savingBackupConfig}
                      className="cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      {savingBackupConfig ? "Guardando..." : "Guardar Preferencias de Copia"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Restauración de Copias Cifradas (.motobackup) */}
            <Card className="border-white/[0.08]">
              <CardHeader className="pb-3 border-b border-white/[0.08]">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                  <Upload className="w-4 h-4 text-[#5AA9E6]" />
                  Restaurar Copia desde Archivo Externo
                </CardTitle>
                <CardDescription className="text-xs text-[#94A3B8]">
                  Carga un archivo <b>.motobackup</b> cifrado generado previamente para recuperar toda la información.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 rounded-xl border border-dashed border-[#5AA9E6]/40 bg-[#5AA9E6]/5 text-center space-y-2">
                  <HardDrive className="w-8 h-8 text-[#5AA9E6] mx-auto opacity-80" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {restoreFile ? restoreFile.name : "Selecciona un archivo cifrado .motobackup"}
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      {restoreFile
                        ? `${(restoreFile.size / 1024).toFixed(1)} KB - Listo para verificar`
                        : "Solo archivos con cifrado oficial de MotoTaller TS7"}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center gap-2">
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.15] transition-colors">
                      <FileArchive className="w-3.5 h-3.5 mr-1.5 text-[#5AA9E6]" />
                      Examinar Archivo...
                      <input
                        type="file"
                        accept=".motobackup"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setRestoreFile(f);
                        }}
                        className="hidden"
                      />
                    </label>

                    {restoreFile && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setBackupToRestore(null);
                          setIsRestoreModalOpen(true);
                        }}
                        className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-black font-bold"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Proceder a Restaurar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Garantía de Integridad & Cifrado:
                  </span>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    Si un archivo de backup fue alterado o proviene de otro sistema, la verificación matemática <b>AES-256-GCM</b> lo detectará y rechazará automáticamente la restauración para evitar corrupción de datos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historial de Copias Almacenadas en el Servidor */}
          <Card className="border-white/[0.08]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#5AA9E6]" />
                  Copias de Seguridad Disponibles en el Servidor ({storedBackups.length})
                </CardTitle>
                <CardDescription className="text-xs text-[#94A3B8]">
                  Archivos encriptados guardados localmente listos para descargar o restaurar en 1 clic
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={loadBackups}
                disabled={loadingBackups}
                className="cursor-pointer text-xs h-7.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingBackups ? "animate-spin" : ""}`} />
                Actualizar Lista
              </Button>
            </CardHeader>

            <CardContent className="pt-3">
              {storedBackups.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Database className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
                  <p className="text-xs text-[#94A3B8]">No hay copias de seguridad generadas aún.</p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleCreateBackupNow}
                    disabled={creatingBackup}
                    className="cursor-pointer text-xs"
                  >
                    Crear la Primera Copia Ahora
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] uppercase text-[#94A3B8] border-b border-white/[0.08]">
                      <tr>
                        <th className="pb-2.5 font-semibold">Tipo / Archivo</th>
                        <th className="pb-2.5 font-semibold">Fecha y Hora</th>
                        <th className="pb-2.5 font-semibold">Tamaño Cifrado</th>
                        <th className="pb-2.5 font-semibold">Contenido Incluido</th>
                        <th className="pb-2.5 font-semibold">Seguridad</th>
                        <th className="pb-2.5 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {storedBackups.map((b) => (
                        <tr key={b.filename} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 pr-2 font-mono">
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="neutral"
                                className={`text-[10px] py-0 px-1.5 ${
                                  b.isAuto
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                }`}
                              >
                                {b.isAuto ? "🤖 Automático" : "👤 Manual"}
                              </Badge>
                              <span className="text-white truncate max-w-[220px]" title={b.filename}>
                                {b.filename}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-2 text-[#94A3B8] whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleString("es-CO", {
                              dateStyle: "short",
                              timeStyle: "medium",
                            })}
                          </td>
                          <td className="py-2.5 pr-2 font-mono text-[#5AA9E6] whitespace-nowrap">
                            {b.sizeFormatted}
                          </td>
                          <td className="py-2.5 pr-2 text-[#94A3B8] whitespace-nowrap">
                            {b.stats ? (
                              <span className="text-[11px]">
                                <b className="text-white">{b.stats.productsCount}</b> repuestos •{" "}
                                <b className="text-white">{b.stats.invoicesCount}</b> ventas •{" "}
                                <b className="text-white">{b.stats.customersCount}</b> clientes
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8]">Base de datos completa</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-2 whitespace-nowrap">
                            <Badge variant="neutral" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              🔒 AES-256-GCM
                            </Badge>
                          </td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  window.open(`/api/backup/download?filename=${encodeURIComponent(b.filename)}`, "_blank")
                                }
                                title="Descargar archivo a tu dispositivo"
                                className="h-7 text-[11px] px-2 cursor-pointer font-semibold"
                              >
                                <Download className="w-3 h-3 mr-1 text-[#5AA9E6]" />
                                Descargar
                              </Button>

                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setBackupToRestore(b);
                                  setRestoreFile(null);
                                  setIsRestoreModalOpen(true);
                                }}
                                title="Restaurar el sistema a este punto"
                                className="h-7 text-[11px] px-2 cursor-pointer bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Restaurar
                              </Button>

                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => setBackupToDelete(b)}
                                title="Eliminar copia del servidor"
                                className="h-7 text-[11px] px-2 cursor-pointer bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30"
                              >
                                <Trash2 className="w-3 h-3" />
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
                  <option value="ADMIN">Dueño (Administrador del Negocio)</option>
                  <option value="SUPERADMIN">Super Usuario (Control Total)</option>
                </select>
              </div>

              {newUserData.role !== "SUPERADMIN" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    🏢 Empresa / Negocio Asignado
                  </label>
                  <select
                    value={newUserData.companyId || (companiesList[0]?.id || "")}
                    onChange={(e) => setNewUserData({ ...newUserData, companyId: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs text-[#EAF4F4] bg-[#222831]/80 border border-[#5AA9E6]/30 rounded-xl focus:outline-none focus:border-[#5AA9E6]"
                  >
                    {companiesList.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.type === "TALLER_MOTOS" ? "🏍️ Taller: " : "🏪 Tienda: "}
                        {comp.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#94A3B8]">
                    El usuario operará exclusivamente con los datos, tickets y módulos de este negocio.
                  </p>
                </div>
              )}

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
                  <option value="ADMIN">Dueño (Administrador del Negocio)</option>
                  <option value="SUPERADMIN">Super Usuario (Control Total)</option>
                </select>
              </div>

              {userToEdit.role !== "SUPERADMIN" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    🏢 Empresa / Negocio Asignado
                  </label>
                  <select
                    value={userToEdit.companyId || (companiesList[0]?.id || "")}
                    onChange={(e) => setUserToEdit({ ...userToEdit, companyId: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs text-[#EAF4F4] bg-[#222831]/80 border border-[#5AA9E6]/30 rounded-xl focus:outline-none focus:border-[#5AA9E6]"
                  >
                    {companiesList.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.type === "TALLER_MOTOS" ? "🏍️ Taller: " : "🏪 Tienda: "}
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

      {/* Modal: Registrar Nueva Empresa / Negocio */}
      {isCreateCompanyOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateCompanyOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-[#222831] border border-[#5AA9E6]/40 rounded-2xl shadow-2xl p-5 text-[#EAF4F4] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5AA9E6]" />
                Registrar Nueva Microempresa o Negocio
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateCompanyOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Nombre del Negocio / Empresa *
                  </label>
                  <Input
                    required
                    placeholder="Ej. Minimarket La Economía"
                    value={newCompanyData.name}
                    onChange={(e) => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Tipo de Actividad / Ramo *
                  </label>
                  <select
                    value={newCompanyData.type}
                    onChange={(e) => setNewCompanyData({ ...newCompanyData, type: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs text-[#EAF4F4] bg-[#222831]/80 border border-[#5AA9E6]/30 rounded-xl focus:outline-none focus:border-[#5AA9E6]"
                  >
                    <option value="TALLER_MOTOS">🏍️ Taller de Motos & Repuestos</option>
                    <option value="TIENDA_COMERCIO">🏪 Tienda de Comercio & Minimarket</option>
                    <option value="FERRETERIA">🔨 Ferretería & Materiales</option>
                    <option value="COMERCIO_GENERAL">🛒 Comercio General / Servicios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    NIT / RUT / Cédula Fiscal *
                  </label>
                  <Input
                    required
                    placeholder="Ej. 901.888.777-1"
                    value={newCompanyData.nit}
                    onChange={(e) => setNewCompanyData({ ...newCompanyData, nit: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <Input
                    placeholder="Ej. (+57) 315 123 4567"
                    value={newCompanyData.phone}
                    onChange={(e) => setNewCompanyData({ ...newCompanyData, phone: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Dirección Física del Local
                </label>
                <Input
                  placeholder="Ej. Calle 12 # 5-20, Centro Comercial"
                  value={newCompanyData.address}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, address: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Eslogan Comercial
                </label>
                <Input
                  placeholder="Ej. Variedad, Calidad y Economía para tu Familia"
                  value={newCompanyData.slogan}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, slogan: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Mensaje Personalizado en Tickets de Venta
                </label>
                <Input
                  placeholder="Ej. ¡Gracias por preferirnos! Conserve este recibo."
                  value={newCompanyData.receiptMessage}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, receiptMessage: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              {/* Logotipo de la Empresa / Negocio */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-[#5AA9E6]" />
                    Logotipo de la Empresa / Negocio
                  </label>
                  {newCompanyData.logoUrl && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Logo cargado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Foto o logo personalizado que se mostrará en el menú lateral, barra de navegación y tickets térmicos de esta empresa.
                </p>

                {newCompanyData.logoUrl ? (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={newCompanyData.logoUrl}
                      alt="Logo de la empresa"
                      className="w-14 h-14 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shadow-md shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs text-white font-medium">Logotipo asignado correctamente</p>
                      <div className="flex items-center gap-2">
                        <label className="px-2.5 py-1 rounded-lg bg-[#5AA9E6]/20 hover:bg-[#5AA9E6]/30 text-xs text-[#5AA9E6] border border-[#5AA9E6]/40 cursor-pointer transition-colors font-medium">
                          Cambiar Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewCompanyLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewCompanyData({ ...newCompanyData, logoUrl: "" })}
                          className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-xs text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-white/20 bg-black/20">
                    <div className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#5AA9E6] shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-[11px]">Sin logo personalizado (usará el ícono comercial)</span>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-[#5AA9E6]/20 hover:bg-[#5AA9E6]/30 border border-[#5AA9E6]/40 text-xs font-semibold text-[#5AA9E6] cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      Subir Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewCompanyLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Selector de Paleta de Colores de la Marca */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#5AA9E6]" />
                    Paleta de Colores de la Marca (Personalización)
                  </label>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/20 bg-black/40 text-[10px] font-bold">
                    <span style={{ color: newCompanyData.primaryColor }}>Acento</span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: newCompanyData.primaryColor }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: newCompanyData.secondaryColor }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#94A3B8] block">Color Primario (Acento / Botones)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newCompanyData.primaryColor || "#5AA9E6"}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
                      />
                      <Input
                        value={newCompanyData.primaryColor || "#5AA9E6"}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, primaryColor: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#5AA9E6"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-[#94A3B8] block">Color Secundario (Fondo / Tarjetas)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newCompanyData.secondaryColor || "#1F3A5F"}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
                      />
                      <Input
                        value={newCompanyData.secondaryColor || "#1F3A5F"}
                        onChange={(e) => setNewCompanyData({ ...newCompanyData, secondaryColor: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#1F3A5F"
                      />
                    </div>
                  </div>
                </div>

                {/* Paletas Rápidas */}
                <div>
                  <span className="text-[10px] text-[#94A3B8] block mb-1">Paletas Rápidas Prediseñadas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => setNewCompanyData({ ...newCompanyData, primaryColor: pal.primary, secondaryColor: pal.secondary })}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[10px] text-[#EAF4F4] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.primary }} />
                        <span>{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateCompanyOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={companyActionLoading}>
                  {companyActionLoading ? "Guardando..." : "Registrar Empresa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Empresa */}
      {isEditCompanyOpen && companyToEdit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222831] border border-[#5AA9E6]/40 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#5AA9E6]" />
                Modificar Empresa: {companyToEdit.name}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsEditCompanyOpen(false);
                  setCompanyToEdit(null);
                }}
                className="text-[#94A3B8] hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCompany} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Nombre del Negocio *
                  </label>
                  <Input
                    required
                    value={companyToEdit.name}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Tipo de Actividad *
                  </label>
                  <select
                    value={companyToEdit.type}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, type: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs text-[#EAF4F4] bg-[#222831]/80 border border-[#5AA9E6]/30 rounded-xl focus:outline-none focus:border-[#5AA9E6]"
                  >
                    <option value="TALLER_MOTOS">🏍️ Taller de Motos & Repuestos</option>
                    <option value="TIENDA_COMERCIO">🏪 Tienda de Comercio & Minimarket</option>
                    <option value="FERRETERIA">🔨 Ferretería & Materiales</option>
                    <option value="COMERCIO_GENERAL">🛒 Comercio General / Servicios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    NIT / RUT *
                  </label>
                  <Input
                    required
                    value={companyToEdit.nit}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, nit: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8] block">
                    Teléfono
                  </label>
                  <Input
                    value={companyToEdit.phone || ""}
                    onChange={(e) => setCompanyToEdit({ ...companyToEdit, phone: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Dirección
                </label>
                <Input
                  value={companyToEdit.address || ""}
                  onChange={(e) => setCompanyToEdit({ ...companyToEdit, address: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Eslogan Comercial
                </label>
                <Input
                  value={companyToEdit.slogan || ""}
                  onChange={(e) => setCompanyToEdit({ ...companyToEdit, slogan: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8] block">
                  Mensaje en Ticket
                </label>
                <Input
                  value={companyToEdit.receiptMessage || ""}
                  onChange={(e) => setCompanyToEdit({ ...companyToEdit, receiptMessage: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              {/* Logotipo de la Empresa / Negocio */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-[#5AA9E6]" />
                    Logotipo de la Empresa / Negocio
                  </label>
                  {companyToEdit.logoUrl && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Logo cargado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Foto o logo personalizado que se mostrará en el menú lateral, barra de navegación y tickets térmicos de esta empresa.
                </p>

                {companyToEdit.logoUrl ? (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={companyToEdit.logoUrl}
                      alt="Logo de la empresa"
                      className="w-14 h-14 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shadow-md shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs text-white font-medium">Logotipo asignado correctamente</p>
                      <div className="flex items-center gap-2">
                        <label className="px-2.5 py-1 rounded-lg bg-[#5AA9E6]/20 hover:bg-[#5AA9E6]/30 text-xs text-[#5AA9E6] border border-[#5AA9E6]/40 cursor-pointer transition-colors font-medium">
                          Cambiar Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditCompanyLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCompanyToEdit({ ...companyToEdit, logoUrl: "" })}
                          className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-xs text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-white/20 bg-black/20">
                    <div className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#5AA9E6] shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-[11px]">Sin logo personalizado (usará el ícono comercial)</span>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-[#5AA9E6]/20 hover:bg-[#5AA9E6]/30 border border-[#5AA9E6]/40 text-xs font-semibold text-[#5AA9E6] cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      Subir Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditCompanyLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Selector de Paleta de Colores de la Marca (Editar) */}
              <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#5AA9E6]" />
                    Paleta de Colores de la Marca (Personalización)
                  </label>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/20 bg-black/40 text-[10px] font-bold">
                    <span style={{ color: companyToEdit.primaryColor || "#5AA9E6" }}>Acento</span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: companyToEdit.primaryColor || "#5AA9E6" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: companyToEdit.secondaryColor || "#1F3A5F" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#94A3B8] block">Color Primario (Acento / Botones)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={companyToEdit.primaryColor || "#5AA9E6"}
                        onChange={(e) => setCompanyToEdit({ ...companyToEdit, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
                      />
                      <Input
                        value={companyToEdit.primaryColor || "#5AA9E6"}
                        onChange={(e) => setCompanyToEdit({ ...companyToEdit, primaryColor: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#5AA9E6"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-[#94A3B8] block">Color Secundario (Fondo / Tarjetas)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={companyToEdit.secondaryColor || "#1F3A5F"}
                        onChange={(e) => setCompanyToEdit({ ...companyToEdit, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
                      />
                      <Input
                        value={companyToEdit.secondaryColor || "#1F3A5F"}
                        onChange={(e) => setCompanyToEdit({ ...companyToEdit, secondaryColor: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#1F3A5F"
                      />
                    </div>
                  </div>
                </div>

                {/* Paletas Rápidas */}
                <div>
                  <span className="text-[10px] text-[#94A3B8] block mb-1">Paletas Rápidas Prediseñadas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => setCompanyToEdit({ ...companyToEdit, primaryColor: pal.primary, secondaryColor: pal.secondary })}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[10px] text-[#EAF4F4] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.primary }} />
                        <span>{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsEditCompanyOpen(false);
                    setCompanyToEdit(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={companyActionLoading}>
                  {companyActionLoading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación de Empresa */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222831] border border-[#F87171]/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#F87171]">
              <div className="w-10 h-10 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#F87171]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Eliminar Empresa</h4>
                <p className="text-xs text-[#94A3B8]">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-xs text-[#EAF4F4] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la empresa{" "}
              <strong className="text-white font-bold">{companyToDelete.name}</strong>{" "}
              (NIT: <span className="font-mono text-[#5AA9E6]">{companyToDelete.nit}</span>)?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCompanyToDelete(null)}
                disabled={companyActionLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteCompany}
                disabled={companyActionLoading}
                className="bg-[#F87171] hover:bg-[#EF4444] text-white"
              >
                {companyActionLoading ? "Eliminando..." : "Eliminar Empresa"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación de Copia de Seguridad */}
      {backupToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222831] border border-[#F87171]/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#F87171]">
              <div className="w-10 h-10 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#F87171]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Eliminar Copia</h4>
                <p className="text-xs text-[#94A3B8]">Esta acción liberará espacio en disco</p>
              </div>
            </div>

            <p className="text-xs text-[#EAF4F4] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la copia{" "}
              <strong className="text-white font-mono">{backupToDelete.filename}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setBackupToDelete(null)}
                disabled={deletingBackup}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteBackup}
                disabled={deletingBackup}
                className="bg-[#F87171] hover:bg-[#EF4444] text-white"
              >
                {deletingBackup ? "Eliminando..." : "Eliminar Copia"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Restauración de Copia Cifrada */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#222831] border border-amber-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Confirmar Restauración del Sistema</h4>
                <p className="text-xs text-amber-300">Descifrado y Recuperación de Datos</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-[#EAF4F4] space-y-1.5 leading-relaxed">
              <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                <span>⚠️ Advertencia de Sobrescritura:</span>
              </p>
              <p>
                Al restaurar esta copia, la base de datos actual (inventario, facturas, clientes y configuraciones) será reemplazada por el estado guardado en este backup cifrado:
              </p>
              <div className="font-mono text-[11px] bg-black/40 p-2 rounded-lg text-[#5AA9E6] break-all">
                {restoreFile ? `📁 Archivo Externo: ${restoreFile.name}` : `💾 Copia del Servidor: ${backupToRestore?.filename}`}
              </div>
            </div>

            <form onSubmit={handleExecuteRestore} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[#94A3B8] block">
                  Para confirmar, escribe exactamente <b className="text-white font-mono">RESTAURAR-COPIA-2026</b>:
                </label>
                <Input
                  type="text"
                  placeholder="RESTAURAR-COPIA-2026"
                  value={restoreConfirmationCode}
                  onChange={(e) => setRestoreConfirmationCode(e.target.value)}
                  className="font-mono text-center tracking-wider text-xs border-amber-500/40 focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsRestoreModalOpen(false);
                    setBackupToRestore(null);
                    setRestoreFile(null);
                    setRestoreConfirmationCode("");
                  }}
                  disabled={restoringBackup}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={restoreConfirmationCode.trim() !== "RESTAURAR-COPIA-2026" || restoringBackup}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${restoringBackup ? "animate-spin" : ""}`} />
                  {restoringBackup ? "Descifrando y Restaurando..." : "Confirmar y Restaurar"}
                </Button>
              </div>
            </form>
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
