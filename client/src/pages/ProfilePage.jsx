import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  Save,
  X,
  AlertCircle,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Heart,
  ShoppingBag,
  Store,
  Map,
  Eye,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Award,
  Camera,
  LogOut,
  Laptop,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { updateProfile, logout } from "../redux/slices/authSlice";
import api from "../services/api";

const MUMBAI_LOCATIONS = [
  "Colaba, Mumbai",
  "Andheri, Mumbai",
  "Bandra, Mumbai",
  "Powai, Mumbai",
  "Juhu, Mumbai",
  "Dadar, Mumbai",
];

const PRESETS_AVATARS = [
  { name: "Profile Portrait 1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop" },
  { name: "Profile Portrait 2", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop" },
  { name: "Profile Portrait 3", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop" },
  { name: "Profile Portrait 4", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" },
  { name: "Profile Portrait 5", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop" },
  { name: "Profile Portrait 6", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop" }
];

const ADDRESS_TAGS = ["Home", "Work", "Store", "Warehouse"];

// Floating luxury micro-particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#e1dcc9]/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  // Active Tab
  const [activeTab, setActiveTab] = useState("identity"); // "identity", "addresses", "upgrade"/"storefront"/"oversight"

  // Personal Info State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome on Windows 11", ip: "103.45.201.12", location: "Bandra, Mumbai", isCurrent: true, icon: Laptop },
    { id: 2, device: "Safari on iPhone 15 Pro", ip: "49.36.88.94", location: "Colaba, Mumbai", isCurrent: false, icon: Smartphone }
  ]);

  // Seller Storefront State
  const [storeName, setStoreName] = useState(user?.storeName || "");
  const [storeDescription, setStoreDescription] = useState(user?.storeDescription || "");
  const [vendorLocation, setVendorLocation] = useState(user?.vendorLocation || MUMBAI_LOCATIONS[0]);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Addresses State
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [street, setStreet] = useState("");
  const [addressTag, setAddressTag] = useState(ADDRESS_TAGS[0]);
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Admin Sellers State
  const [sellersList, setSellersList] = useState([]);
  const [isFetchingSellers, setIsFetchingSellers] = useState(false);
  const [sellersSearchQuery, setSellersSearchQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isUpdatingSellerStatus, setIsUpdatingSellerStatus] = useState(false);

  // Upgrade Application State
  const [upgradeStoreName, setUpgradeStoreName] = useState("");
  const [upgradeStoreDescription, setUpgradeStoreDescription] = useState("");
  const [upgradeVendorLocation, setUpgradeVendorLocation] = useState(MUMBAI_LOCATIONS[0]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeApplied, setUpgradeApplied] = useState(false);
  const [estimatorSales, setEstimatorSales] = useState(150000);

  // Avatar Modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  // Helpers
  const parseStreetAndTag = (streetStr) => {
    if (!streetStr) return { street: "", tag: ADDRESS_TAGS[0] };
    const parts = streetStr.split(" | ");
    return {
      street: parts[0] || "",
      tag: parts[1] || ADDRESS_TAGS[0]
    };
  };

  const getInitials = (name) => {
    if (!name) return "VH";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Director Console";
    if (user?.role === "seller") return "Store Curator";
    return "Platinum Member";
  };

  const getTagBadgeStyle = (tag) => {
    switch (tag) {
      case "Work": return "border-[#412d15] text-[#e1dcc9]/80 bg-[#1f150c]/40";
      case "Store": return "border-[#e1dcc9]/30 text-[#e1dcc9] bg-[#412d15]/50 shadow-[0_0_12px_rgba(225,220,201,0.06)]";
      case "Warehouse": return "border-[#412d15] text-muted-foreground bg-[#1f150c]/30";
      default: return "border-[#412d15] text-muted-foreground bg-[#1f150c]/30";
    }
  };

  // Interactive mouse shine follow logic
  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  // Sync state on load
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setStoreName(user.storeName || "");
      setStoreDescription(user.storeDescription || "");
      setVendorLocation(user.vendorLocation || MUMBAI_LOCATIONS[0]);
    }
  }, [user]);

  // Fetch Sellers (Admin only)
  const fetchSellers = async () => {
    if (user?.role !== "admin") return;
    setIsFetchingSellers(true);
    try {
      const response = await api.get("/admin/users?role=seller&limit=100");
      const list = response.data?.data || response.data?.users || [];
      setSellersList(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seller list.");
    } finally {
      setIsFetchingSellers(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSellers();
    }
  }, [user]);

  // Action Handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setIsSavingProfile(true);
    try {
      const result = await dispatch(updateProfile({ name: profileName, email: profileEmail }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Profile updated successfully.");
        setIsEditingProfile(false);
      } else {
        toast.error(result.payload || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("Failed to update profile details.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRevokeSession = (id) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Device logged out.");
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !vendorLocation.trim()) {
      toast.error("Store name and location are required.");
      return;
    }
    setIsSavingStore(true);
    try {
      const result = await dispatch(
        updateProfile({
          storeName: storeName.trim(),
          storeDescription: storeDescription.trim(),
          vendorLocation: vendorLocation,
        })
      );
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Store details updated.");
        setIsEditingStore(false);
      } else {
        toast.error(result.payload || "Failed to update store details.");
      }
    } catch (err) {
      toast.error("Failed to update store settings.");
    } finally {
      setIsSavingStore(false);
    }
  };

  const saveAddressesToDB = async (updatedAddresses) => {
    try {
      const result = await dispatch(updateProfile({ addresses: updatedAddresses }));
      return updateProfile.fulfilled.match(result);
    } catch (err) {
      return false;
    }
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setStreet("");
    setAddressTag(ADDRESS_TAGS[0]);
    setCity("");
    setStateName("");
    setPincode("");
    setCountry("India");
    setIsDefault(user?.addresses?.length === 0);
    setIsAddressFormOpen(true);
  };

  const openEditAddress = (addr) => {
    const parsed = parseStreetAndTag(addr.street);
    setEditingAddressId(addr._id);
    setStreet(parsed.street);
    setAddressTag(parsed.tag);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setCountry(addr.country || "India");
    setIsDefault(addr.isDefault || false);
    setIsAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      toast.error("All address fields are required.");
      return;
    }

    setIsSavingAddress(true);
    let currentAddresses = user?.addresses ? [...user.addresses] : [];

    if (isDefault) {
      currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const combinedStreetField = street.trim() + " | " + addressTag;
    const addressPayload = {
      street: combinedStreetField,
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      country: country.trim(),
      isDefault: isDefault,
    };

    if (editingAddressId) {
      currentAddresses = currentAddresses.map((addr) =>
        addr._id === editingAddressId ? { ...addr, ...addressPayload } : addr
      );
    } else {
      currentAddresses.push(addressPayload);
    }

    const success = await saveAddressesToDB(currentAddresses);
    setIsSavingAddress(false);

    if (success) {
      toast.success(editingAddressId ? "Address updated." : "Address added.");
      closeAddressForm();
    } else {
      toast.error("Failed to save address.");
    }
  };

  const handleDeleteAddress = async (addrId) => {
    const confirmDelete = window.confirm("Delete this address?");
    if (!confirmDelete) return;

    const currentAddresses = user?.addresses ? [...user.addresses] : [];
    const targetAddress = currentAddresses.find((a) => a._id === addrId);
    let updatedAddresses = currentAddresses.filter((addr) => addr._id !== addrId);

    if (targetAddress?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    const success = await saveAddressesToDB(updatedAddresses);
    if (success) {
      toast.success("Address removed.");
    } else {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    let currentAddresses = user?.addresses ? [...user.addresses] : [];
    currentAddresses = currentAddresses.map((a) => ({
      ...a,
      isDefault: a._id === addrId,
    }));

    const success = await saveAddressesToDB(currentAddresses);
    if (success) {
      toast.success("Default address updated.");
    }
  };

  const handleToggleSellerActive = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      const response = await api.patch(`/admin/users/${sellerId}/toggle-active`);
      const updatedStatus = response.data?.data?.isActive;

      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isActive: updatedStatus } : s))
      );

      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) => ({ ...prev, isActive: updatedStatus }));
      }

      toast.success(`Seller status changed.`);
    } catch (err) {
      toast.error("Failed to change seller status.");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };

  const handleApproveSeller = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      await api.patch(`/admin/vendors/${sellerId}/approve`);
      
      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isVendorApproved: true } : s))
      );

      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) => ({ ...prev, isVendorApproved: true }));
      }

      toast.success("Seller approved.");
    } catch (err) {
      toast.error("Failed to approve seller.");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };

  const handleSuspendSeller = async (sellerId) => {
    setIsUpdatingSellerStatus(true);
    try {
      await api.patch(`/admin/vendors/${sellerId}/reject`);
      
      setSellersList((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isVendorApproved: false, isActive: false } : s))
      );

      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) => ({ ...prev, isVendorApproved: false, isActive: false }));
      }

      toast.success("Seller suspended.");
    } catch (err) {
      toast.error("Failed to suspend seller.");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    if (!upgradeStoreName.trim() || !upgradeStoreDescription.trim()) {
      toast.error("Please enter a store name and description.");
      return;
    }

    setIsUpgrading(true);
    try {
      const result = await dispatch(
        updateProfile({
          storeName: upgradeStoreName.trim(),
          storeDescription: upgradeStoreDescription.trim(),
          vendorLocation: upgradeVendorLocation,
        })
      );

      if (updateProfile.fulfilled.match(result)) {
        setTimeout(() => {
          setIsUpgrading(false);
          setUpgradeApplied(true);
          toast.success("Seller application submitted.");
        }, 1000);
      } else {
        toast.error(result.payload || "Failed to submit details.");
        setIsUpgrading(false);
      }
    } catch (err) {
      toast.error("Failed to submit seller application.");
      setIsUpgrading(false);
    }
  };

  const handleSelectAvatarUrl = async (url) => {
    try {
      const result = await dispatch(updateProfile({ avatar: { url } }));
      if (updateProfile.fulfilled.match(result)) {
        toast.success("Profile picture updated.");
        setIsAvatarModalOpen(false);
        setCustomAvatarUrl("");
      } else {
        toast.error(result.payload || "Failed to save picture.");
      }
    } catch (err) {
      toast.error("Failed to update profile picture.");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    dispatch(logout());
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const filteredSellers = sellersList.filter((s) => {
    const q = sellersSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.storeName?.toLowerCase().includes(q) ||
      s.vendorLocation?.toLowerCase().includes(q)
    );
  });

  const memberSinceDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "May 2026";

  const memberUID = user?._id
    ? `VH-${user._id.slice(-4).toUpperCase()}-${new Date(user.createdAt || Date.now()).getFullYear()}`
    : "VH-7701-2026";

  return (
    <div className="min-h-screen bg-black text-[#e1dcc9] pt-6 sm:pt-10 pb-16 px-4 md:px-8 max-w-6xl mx-auto selection:bg-[#e1dcc9]/20 selection:text-white font-sans antialiased relative overflow-hidden">
      
      {/* Editorial Glowing Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full bg-[#412d15]/10 blur-[130px] animate-pulse animate-float" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[10%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#d97706]/5 blur-[160px] animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      {/* Floating Micro-Dust Particles */}
      <FloatingParticles />

      {/* Page Header */}
      <div className="border-b border-[#412d15] pb-6 mb-8 text-left relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#e1dcc9]/50 uppercase flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3 h-3 text-[#e1dcc9]" /> Your Account
            </span>
            <h1 className="text-4xl md:text-5xl font-anton font-black tracking-[0.14em] gradient-text uppercase leading-none">
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-3 text-xs md:text-sm font-light max-w-xl leading-relaxed">
              Manage your personal info, delivery addresses, store settings, and active devices.
            </p>
          </div>
          
          <div className="inline-flex items-center gap-2 border border-[#e1dcc9]/10 rounded-full px-4 py-2 bg-[#1f150c]/25 backdrop-blur-md self-start md:self-auto shadow-premium">
            <span className="h-2 w-2 rounded-full bg-[#e1dcc9] animate-pulse shadow-[0_0_8px_#e1dcc9]" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/70 font-bold">
              Securely Connected
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Column: Member Passport Card & Responsive Tabs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Passport Identity Card with interactive Spotlight Shine */}
          <div 
            onMouseMove={handleMouseMove}
            className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-[#1f150c]/25 rounded-[2rem] p-6 relative overflow-hidden text-left shadow-[0_24px_55px_rgba(0,0,0,0.85)] group transition-all duration-500 hover:border-[#e1dcc9]/20"
          >
            {/* Ambient luxury light bleed inside card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.03] to-transparent pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-[#412d15]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-row lg:flex-col items-center lg:items-start gap-5 relative z-10 w-full">
              
              {/* Photo placeholder with rotating/pulsing dashed luxury halo */}
              <div 
                onClick={() => setIsAvatarModalOpen(true)}
                className="relative cursor-pointer shrink-0 group/avatar"
              >
                {/* Rotating luxury halo */}
                <div className="absolute inset-[-6px] rounded-full border border-dashed border-[#e1dcc9]/30 scale-100 opacity-80 group-hover/avatar:opacity-100 group-hover/avatar:scale-105 transition-all duration-700 animate-[spin_25s_linear_infinite]" />
                <div className="absolute inset-[-3px] rounded-full border border-[#e1dcc9]/15 scale-95 group-hover/avatar:scale-100 transition-all duration-500 animate-pulse" />

                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-black border border-[#412d15] flex items-center justify-center shadow-lg relative z-10">
                  {user?.avatar?.url ? (
                    <img 
                      src={user.avatar.url} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-anton font-black text-[#e1dcc9]">
                      {getInitials(user?.name)}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-200 z-20">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 relative z-10 w-full">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-anton font-black tracking-wider text-white uppercase truncate">
                    {user?.name || "Member"}
                  </h2>
                  <span className="shrink-0 inline-block text-[7px] font-mono text-[#e1dcc9]/60 bg-black/30 border border-[#412d15] rounded px-1.5 py-0.5 uppercase tracking-wider">Verified</span>
                </div>
                <span className="inline-block mt-1.5 text-[8px] font-mono font-bold tracking-widest uppercase bg-[#412d15] border border-[#e1dcc9]/10 text-[#e1dcc9] px-2.5 py-0.5 rounded-lg shadow-sm">
                  {getRoleLabel()}
                </span>
                
                <div className="hidden lg:block border-t border-[#412d15]/40 my-4" />
                
                <div className="hidden sm:flex lg:flex flex-col gap-1.5 text-[11px] text-muted-foreground font-light mt-2 lg:mt-0">
                  <span className="truncate">{user?.email}</span>
                  <span className="text-[10px] text-[#e1dcc9]/40 font-mono uppercase tracking-wider">Joined {memberSinceDate}</span>
                  <span className="text-[8px] text-[#e1dcc9]/50 font-mono uppercase tracking-widest block mt-1">Dossier ID: {memberUID}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Platform Shortcuts (Extremely User Friendly) */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate("/explore?wishlist=true")}
              className="glass-card border border-[#e1dcc9]/10 hover:border-[#e1dcc9]/30 bg-[#1f150c]/15 hover:bg-[#1f150c]/30 rounded-2xl p-4 text-center transition-all duration-300 group shadow-md"
            >
              <Heart className="w-4 h-4 mx-auto text-[#e1dcc9]/60 group-hover:text-red-400 group-hover:scale-110 transition-all duration-300 mb-1.5" />
              <span className="block text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Wishlist</span>
              <span className="text-xs font-anton tracking-wider text-white uppercase">{user?.wishlist?.length || 0} Saved</span>
            </button>

            <button 
              onClick={() => setActiveTab("addresses")}
              className="glass-card border border-[#e1dcc9]/10 hover:border-[#e1dcc9]/30 bg-[#1f150c]/15 hover:bg-[#1f150c]/30 rounded-2xl p-4 text-center transition-all duration-300 group shadow-md"
            >
              <MapPin className="w-4 h-4 mx-auto text-[#e1dcc9]/60 group-hover:text-[#e1dcc9] group-hover:scale-110 transition-all duration-300 mb-1.5" />
              <span className="block text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Addresses</span>
              <span className="text-xs font-anton tracking-wider text-white uppercase">{user?.addresses?.length || 0} Places</span>
            </button>
          </div>

          {/* Fully Responsive & Swipe-optimized Tabs Selector */}
          <div className="border border-[#412d15] bg-[#1f150c]/15 p-1.5 rounded-2xl shadow-premium backdrop-blur-sm relative">
            
            {/* Scroll fading masks for mobile swiping visual indicators */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#000]/40 to-transparent pointer-events-none lg:hidden z-20" />
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#000]/40 to-transparent pointer-events-none lg:hidden z-20" />

            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 scrollbar-none relative z-10 pr-2 pl-2 lg:px-0">
              <button
                onClick={() => setActiveTab("identity")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-left transition-all duration-300 whitespace-nowrap relative overflow-hidden group shrink-0 lg:shrink-1 ${
                  activeTab === "identity"
                    ? "bg-[#e1dcc9] text-black shadow-premium border border-[#e1dcc9]/10"
                    : "text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground border border-transparent hover:border-[#412d15]/60 lg:hover:pl-5"
                }`}
              >
                {activeTab === "identity" && (
                  <span className="absolute top-0 right-0 w-12 h-12 bg-white/20 blur-md rounded-full pointer-events-none transform translate-x-3 -translate-y-3" />
                )}
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Personal Info</span>
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-left transition-all duration-300 whitespace-nowrap relative overflow-hidden group shrink-0 lg:shrink-1 ${
                  activeTab === "addresses"
                    ? "bg-[#e1dcc9] text-black shadow-premium border border-[#e1dcc9]/10"
                    : "text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground border border-transparent hover:border-[#412d15]/60 lg:hover:pl-5"
                }`}
              >
                {activeTab === "addresses" && (
                  <span className="absolute top-0 right-0 w-12 h-12 bg-white/20 blur-md rounded-full pointer-events-none transform translate-x-3 -translate-y-3" />
                )}
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>My Addresses ({user?.addresses?.length || 0})</span>
              </button>

              {user?.role === "buyer" && (
                <button
                  onClick={() => setActiveTab("upgrade")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-left transition-all duration-300 whitespace-nowrap relative overflow-hidden group shrink-0 lg:shrink-1 ${
                    activeTab === "upgrade"
                      ? "bg-[#e1dcc9] text-black shadow-premium border border-[#e1dcc9]/10"
                      : "text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground border border-transparent hover:border-[#412d15]/60 lg:hover:pl-5"
                  }`}
                >
                  {activeTab === "upgrade" && (
                    <span className="absolute top-0 right-0 w-12 h-12 bg-white/20 blur-md rounded-full pointer-events-none transform translate-x-3 -translate-y-3" />
                  )}
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Become a Seller</span>
                </button>
              )}

              {user?.role === "seller" && (
                <button
                  onClick={() => setActiveTab("storefront")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-left transition-all duration-300 whitespace-nowrap relative overflow-hidden group shrink-0 lg:shrink-1 ${
                    activeTab === "storefront"
                      ? "bg-[#e1dcc9] text-black shadow-premium border border-[#e1dcc9]/10"
                      : "text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground border border-transparent hover:border-[#412d15]/60 lg:hover:pl-5"
                  }`}
                >
                  {activeTab === "storefront" && (
                    <span className="absolute top-0 right-0 w-12 h-12 bg-white/20 blur-md rounded-full pointer-events-none transform translate-x-3 -translate-y-3" />
                  )}
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span>Store Settings</span>
                </button>
              )}

              {user?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("oversight")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-left transition-all duration-300 whitespace-nowrap relative overflow-hidden group shrink-0 lg:shrink-1 ${
                    activeTab === "oversight"
                      ? "bg-[#e1dcc9] text-black shadow-premium border border-[#e1dcc9]/10"
                      : "text-muted-foreground hover:bg-[#412d15]/30 hover:text-foreground border border-transparent hover:border-[#412d15]/60 lg:hover:pl-5"
                  }`}
                >
                  {activeTab === "oversight" && (
                    <span className="absolute top-0 right-0 w-12 h-12 bg-white/20 blur-md rounded-full pointer-events-none transform translate-x-3 -translate-y-3" />
                  )}
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span>Manage Sellers</span>
                </button>
              )}
            </div>

            {/* Premium Log Out Button (Highly User Friendly & Standardized) */}
            <div className="border-t border-[#412d15]/40 mt-3 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-left transition-all duration-300 text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 w-full shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>Log Out Account</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Tab Contents */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* Personal Info Tab */}
            {activeTab === "identity" && (
              <motion.div
                key="tab-identity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                <div 
                  onMouseMove={handleMouseMove}
                  className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black rounded-[2rem] p-5 sm:p-6 md:p-8 relative shadow-premium overflow-hidden group hover:border-[#e1dcc9]/20 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.015] to-transparent pointer-events-none" />
                  
                  {/* Watermark logo */}
                  <UserIcon className="absolute right-6 bottom-4 text-[#e1dcc9]/[0.02] w-24 h-24 pointer-events-none" />

                  <div className="flex justify-between items-center mb-6 border-b border-[#412d15] pb-4 relative z-10">
                    <h3 className="text-lg font-anton tracking-widest text-[#e1dcc9] uppercase font-black">Personal Information</h3>
                    
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="text-[10px] font-mono font-bold uppercase tracking-wider border border-[#412d15] bg-[#1c130b]/35 hover:bg-[#412d15]/30 text-[#e1dcc9] px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#e1dcc9]/40 uppercase block">Display Name</span>
                        <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-3 text-sm text-[#e1dcc9] shadow-inner">
                          {user?.name || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#e1dcc9]/40 uppercase block">Email Address</span>
                        <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-3 text-sm text-[#e1dcc9] shadow-inner">
                          {user?.email || "Not set"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileSubmit} className="space-y-5 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono font-bold tracking-widest text-[#e1dcc9]/40 uppercase block">Display Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono font-bold tracking-widest text-[#e1dcc9]/40 uppercase block">Email Address</label>
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-sm text-[#e1dcc9] placeholder-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 focus:shadow-[0_0_20px_rgba(225,220,201,0.08)] transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="text-[10px] font-mono uppercase tracking-wider border border-[#412d15] hover:bg-[#412d15]/20 text-muted-foreground px-4 py-2 rounded-xl transition-all"
                          disabled={isSavingProfile}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] px-5 py-2 rounded-xl transition-all shadow-premium"
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Logged in Devices */}
                <div 
                  onMouseMove={handleMouseMove}
                  className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-premium overflow-hidden group hover:border-[#e1dcc9]/20 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.015] to-transparent pointer-events-none" />
                  <h3 className="text-lg font-anton tracking-widest text-[#e1dcc9] uppercase font-black mb-2 relative z-10">Active Logins</h3>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider border-b border-[#412d15] pb-4 mb-5 relative z-10">Devices currently logged in</p>

                  <div className="space-y-3.5 relative z-10">
                    {activeSessions.map((session) => {
                      return (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-[#412d15]/80 bg-black/45 group/session hover:border-[#e1dcc9]/25 hover:bg-black transition-all duration-300 shadow-inner"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#412d15]/40 border border-[#412d15] flex items-center justify-center text-[#e1dcc9]">
                              {session.isCurrent ? <Check className="w-4 h-4 text-[#e1dcc9]" /> : <Laptop className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{session.device}</h4>
                                {session.isCurrent && (
                                  <span className="bg-[#e1dcc9]/10 border border-[#e1dcc9]/25 text-[#e1dcc9] px-1.5 py-0.2 rounded text-[7px] font-mono uppercase tracking-widest shadow-sm">This Device</span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{session.location}</p>
                            </div>
                          </div>

                          {!session.isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-[9px] font-mono uppercase tracking-wider border border-[#412d15] bg-[#1c130b]/20 hover:bg-red-950/20 hover:border-red-900/30 hover:text-red-400 px-2.5 py-1.5 rounded-lg transition-all opacity-0 group-hover/session:opacity-100 shadow-sm"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Address Book Tab */}
            {activeTab === "addresses" && (
              <motion.div
                key="tab-addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                <div 
                  onMouseMove={handleMouseMove}
                  className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-premium overflow-hidden group hover:border-[#e1dcc9]/20 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.015] to-transparent pointer-events-none" />
                  
                  {/* Watermark logo */}
                  <MapPin className="absolute right-6 bottom-4 text-[#e1dcc9]/[0.02] w-24 h-24 pointer-events-none" />

                  <div className="flex justify-between items-center mb-6 border-b border-[#412d15] pb-4 relative z-10">
                    <div>
                      <h3 className="text-lg font-anton tracking-widest text-[#e1dcc9] uppercase font-black">Address Book</h3>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-1">Manage your shipping locations</p>
                    </div>

                    {!isAddressFormOpen && (
                      <button
                        onClick={openAddAddress}
                        className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] px-4 py-2 rounded-xl transition-all shadow-premium"
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>

                  {/* Add/Edit address form */}
                  <AnimatePresence>
                    {isAddressFormOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-[#412d15] bg-black/45 rounded-xl p-5 mb-6 overflow-hidden relative z-10"
                      >
                        <div className="flex justify-between items-center mb-4 border-b border-[#412d15] pb-2">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#e1dcc9]">
                            {editingAddressId ? "Edit Address" : "Add New Address"}
                          </h4>
                          <button onClick={closeAddressForm} className="text-muted-foreground hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                          
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block font-bold">Category Label</label>
                            <div className="flex gap-2">
                              {ADDRESS_TAGS.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => setAddressTag(tag)}
                                  className={`px-3 py-1 text-[10px] font-mono uppercase rounded-lg border transition-all ${
                                    addressTag === tag
                                      ? "bg-[#e1dcc9] border-transparent text-black shadow-sm"
                                      : "border-[#412d15] text-muted-foreground hover:border-[#e1dcc9]/30 bg-transparent"
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block font-bold">Street Address</label>
                            <input
                              type="text"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              required
                              placeholder="Landmark, street, suite..."
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] placeholder-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block font-bold">City</label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block font-bold">State</label>
                              <input
                                type="text"
                                value={stateName}
                                onChange={(e) => setStateName(e.target.value)}
                                required
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block font-bold">Pincode</label>
                              <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#412d15] mt-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="rounded border-[#412d15] bg-black/55 accent-[#e1dcc9] text-black"
                              />
                              <span className="text-[10px] text-muted-foreground font-light">Set as primary address</span>
                            </label>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={closeAddressForm}
                                className="text-[10px] font-mono uppercase tracking-wider border border-[#412d15] text-muted-foreground px-4 py-2 rounded-xl hover:bg-[#412d15]/20"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black px-4 py-2 rounded-xl hover:bg-[#c9c4b2] shadow-sm"
                                disabled={isSavingAddress}
                              >
                                {isSavingAddress ? "Saving..." : "Save Address"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* List Addresses styled as custom luxury letterhead stubs */}
                  <div className="space-y-4 relative z-10">
                    {!user?.addresses || user.addresses.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-[#412d15] rounded-2xl bg-[#1f150c]/10">
                        <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground font-light">
                          You have no shipping addresses saved.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((addr) => {
                          const parsed = parseStreetAndTag(addr.street);
                          return (
                            <div 
                              key={addr._id}
                              className={`border rounded-2xl p-5 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black flex flex-col justify-between transition-all duration-500 relative overflow-hidden group shadow-premium hover:shadow-premium-hover ${
                                addr.isDefault ? "border-[#e1dcc9]/50 shadow-premium" : "border-[#412d15] hover:border-[#e1dcc9]/30"
                              }`}
                            >
                              {/* Left side thin brass accent strip for luxury look */}
                              <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${
                                addr.isDefault ? "from-[#e1dcc9] to-transparent" : "from-[#412d15] to-transparent"
                              }`} />

                              <div className="space-y-3 pl-2">
                                <div className="flex justify-between items-center">
                                  <span className={`inline-block border px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider ${getTagBadgeStyle(parsed.tag)}`}>
                                    {parsed.tag}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#e1dcc9] font-bold">Primary</span>
                                  )}
                                </div>
                                
                                <p className="text-sm font-semibold text-white">{parsed.street}</p>
                                <p className="text-xs text-muted-foreground font-light">{addr.city}, {addr.state} &mdash; {addr.pincode}</p>
                              </div>

                              <div className="border-t border-[#412d15]/40 mt-4 pt-3 flex items-center justify-between pl-2">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/40">{addr.country}</span>
                                
                                <div className="flex gap-2.5">
                                  {!addr.isDefault && (
                                    <button 
                                      onClick={() => handleSetDefaultAddress(addr._id)}
                                      className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground hover:text-[#e1dcc9] transition-colors"
                                    >
                                      Set as Primary
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => openEditAddress(addr)}
                                    className="text-muted-foreground hover:text-[#e1dcc9] transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteAddress(addr._id)}
                                    className="text-muted-foreground hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* Become a Seller Tab */}
            {user?.role === "buyer" && activeTab === "upgrade" && (
              <motion.div
                key="tab-upgrade"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                <div 
                  onMouseMove={handleMouseMove}
                  className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-premium overflow-hidden group hover:border-[#e1dcc9]/20 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.015] to-transparent pointer-events-none" />
                  
                  {/* Watermark logo */}
                  <Award className="absolute right-6 bottom-4 text-[#e1dcc9]/[0.02] w-24 h-24 pointer-events-none" />

                  <div className="border-b border-[#412d15] pb-4 mb-6 relative z-10">
                    <h3 className="text-lg font-anton tracking-widest text-[#e1dcc9] uppercase font-black">Seller Application</h3>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-1">Apply to sell premium products on our marketplace</p>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="border border-[#412d15] bg-[#1f150c]/10 p-5 rounded-xl">
                      <h4 className="text-sm font-anton tracking-wider text-white uppercase mb-2 font-black">Sellers & Storefronts</h4>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        Registered sellers get access to custom product catalogs, local dispatch options, earnings calculators, and automated updates.
                      </p>
                    </div>

                    {upgradeApplied ? (
                      <div className="border border-emerald-500/25 bg-emerald-500/5 px-6 py-4 rounded-xl text-xs font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.06)]">
                        <div className="font-mono uppercase tracking-wider font-bold">Application Submitted</div>
                        <p className="text-white/50 text-[11px] font-normal mt-1 leading-relaxed">Your store name and brand description have been received. Our team will review your application within 24 hours.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleUpgradeSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/50 block font-bold">Store Name</label>
                            <input
                              type="text"
                              value={upgradeStoreName}
                              onChange={(e) => setUpgradeStoreName(e.target.value)}
                              required
                              placeholder="e.g. Vintage Vault"
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] placeholder-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/50 block font-bold">Store Location</label>
                            <select
                              value={upgradeVendorLocation}
                              onChange={(e) => setUpgradeVendorLocation(e.target.value)}
                              required
                              className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none cursor-pointer focus:border-[#e1dcc9]/40 shadow-inner"
                            >
                              {MUMBAI_LOCATIONS.map((loc) => (
                                <option key={loc} value={loc} className="bg-black text-[#e1dcc9]">{loc}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/50 block font-bold">Store Description</label>
                          <textarea
                            value={upgradeStoreDescription}
                            onChange={(e) => setUpgradeStoreDescription(e.target.value)}
                            required
                            rows={3}
                            placeholder="Describe your brand, products, and what makes your store unique..."
                            className="w-full p-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] placeholder-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                          />
                        </div>

                        {/* Earnings Calculator */}
                        <div className="border border-[#412d15] bg-black/45 p-6 rounded-2xl space-y-4 shadow-inner relative overflow-hidden">
                          {/* Fine luxury brass shine inside ledger split */}
                          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#e1dcc9]/10 to-transparent pointer-events-none" />

                          <div className="flex justify-between items-center border-b border-[#412d15]/50 pb-3">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-white">Earnings Calculator</h4>
                            <span className="text-sm font-semibold text-[#e1dcc9] font-mono font-sans">₹{estimatorSales.toLocaleString()}</span>
                          </div>

                          <div className="space-y-1">
                            <input 
                              type="range"
                              min="10000"
                              max="1000000"
                              step="10000"
                              value={estimatorSales}
                              onChange={(e) => setEstimatorSales(Number(e.target.value))}
                              className="w-full h-1 bg-[#412d15] rounded-lg appearance-none cursor-pointer accent-[#e1dcc9]"
                            />
                            <div className="flex justify-between text-[9px] text-muted-foreground font-mono pt-1">
                              <span>₹10,000</span>
                              <span>₹1,000,000</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-2 text-left font-mono">
                            <div className="border border-[#412d15] bg-black p-3 rounded-lg relative overflow-hidden hover:border-[#e1dcc9]/20 transition-all duration-300">
                              <span className="block text-[8px] text-muted-foreground uppercase mb-1">Your Share (92%)</span>
                              <span className="text-xs font-semibold text-emerald-400">₹{Math.round(estimatorSales * 0.92).toLocaleString()}</span>
                            </div>
                            <div className="border border-[#412d15] bg-black p-3 rounded-lg relative overflow-hidden">
                              <span className="block text-[8px] text-muted-foreground uppercase mb-1">Fee (8%)</span>
                              <span className="text-xs font-semibold text-muted-foreground">₹{Math.round(estimatorSales * 0.08).toLocaleString()}</span>
                            </div>
                            <div className="border border-[#412d15] bg-black p-3 rounded-lg relative overflow-hidden">
                              <span className="block text-[8px] text-muted-foreground uppercase mb-1">Saved Fees</span>
                              <span className="text-xs font-semibold text-[#e1dcc9]">₹{Math.round(estimatorSales * 0.05).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] px-5 py-3 rounded-xl transition-all shadow-premium"
                            disabled={isUpgrading}
                          >
                            {isUpgrading ? "Submitting..." : "Submit Application"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Storefront Credentials Tab */}
            {user?.role === "seller" && activeTab === "storefront" && (
              <motion.div
                key="tab-storefront"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                <div 
                  onMouseMove={handleMouseMove}
                  className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-premium overflow-hidden group hover:border-[#e1dcc9]/20 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.015] to-transparent pointer-events-none" />
                  
                  {/* Watermark logo */}
                  <Store className="absolute right-6 bottom-4 text-[#e1dcc9]/[0.02] w-24 h-24 pointer-events-none" />

                  <div className="flex justify-between items-center mb-6 border-b border-[#412d15] pb-4 relative z-10">
                    <div>
                      <h3 className="text-lg font-anton tracking-widest text-[#e1dcc9] uppercase font-black">Store Settings</h3>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-1">Branding & Dispatch Hub</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {user?.isVendorApproved ? (
                        <span className="border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="border border-amber-500/25 bg-amber-500/5 text-amber-400 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider animate-pulse">Under Review</span>
                      )}

                      {!isEditingStore && (
                        <button
                          onClick={() => setIsEditingStore(true)}
                          className="text-[10px] font-mono font-bold uppercase tracking-wider border border-[#412d15] bg-[#1c130b]/35 hover:bg-[#412d15]/30 text-[#e1dcc9] px-3 py-1.5 rounded-xl transition-all shadow-premium"
                        >
                          Modify Store
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditingStore ? (
                    <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground uppercase block">Store Name</span>
                          <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-3 text-sm text-[#e1dcc9] font-semibold shadow-inner">
                            {user?.storeName || "Vintage Store"}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground uppercase block">Store Location</span>
                          <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-3 text-sm text-[#e1dcc9] flex items-center gap-2 shadow-inner">
                            <MapPin className="w-3.5 h-3.5 text-[#e1dcc9]" />
                            {user?.vendorLocation || "Bandra, Mumbai"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground uppercase block">Store Description</span>
                        <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-3 text-xs leading-relaxed text-muted-foreground min-h-[90px] font-light shadow-inner">
                          {user?.storeDescription || "Add details describing your store, values, and products."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleStoreSubmit} className="space-y-5 relative z-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/50 block font-bold">Store Name</label>
                          <input
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/50 block font-bold">Store Location</label>
                          <select
                            value={vendorLocation}
                            onChange={(e) => setVendorLocation(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none cursor-pointer focus:border-[#e1dcc9]/40 shadow-inner"
                          >
                            {MUMBAI_LOCATIONS.map((loc) => (
                              <option key={loc} value={loc} className="bg-black text-[#e1dcc9]">{loc}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-[#e1dcc9]/50 block font-bold">Store Description</label>
                        <textarea
                          value={storeDescription}
                          onChange={(e) => setStoreDescription(e.target.value)}
                          rows={3}
                          className="w-full p-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingStore(false)}
                          className="text-[10px] font-mono uppercase tracking-wider border border-[#412d15] text-muted-foreground px-4 py-2 rounded-xl hover:bg-[#412d15]/20"
                          disabled={isSavingStore}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black px-4 py-2 rounded-xl hover:bg-[#c9c4b2] shadow-premium"
                          disabled={isSavingStore}
                        >
                          {isSavingStore ? "Saving..." : "Save Store Details"}
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </motion.div>
            )}

            {/* Admin Oversight Tab */}
            {user?.role === "admin" && activeTab === "oversight" && (
              <motion.div
                key="tab-oversight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-left"
              >
                <div 
                  onMouseMove={handleMouseMove}
                  className="glass-card spotlight-card border border-[#e1dcc9]/10 bg-gradient-to-br from-[#1f150c]/20 via-black/45 to-black rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-premium overflow-hidden group hover:border-[#e1dcc9]/20 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e1dcc9]/[0.015] to-transparent pointer-events-none" />
                  
                  {/* Watermark logo */}
                  <ShieldCheck className="absolute right-6 bottom-4 text-[#e1dcc9]/[0.02] w-24 h-24 pointer-events-none" />

                  <div className="flex justify-between items-center mb-6 border-b border-[#412d15] pb-4 relative z-10">
                    <div>
                      <h3 className="text-lg font-anton tracking-widest text-[#e1dcc9] uppercase font-black">Manage Sellers</h3>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-1">Review and approve new store applications</p>
                    </div>

                    <button
                      onClick={fetchSellers}
                      className="p-2.5 border border-[#412d15] bg-[#1c130b]/20 hover:bg-[#412d15]/30 text-[#e1dcc9] rounded-xl transition-all shadow-premium"
                      disabled={isFetchingSellers}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSellers ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Filter Search */}
                  <div className="relative mb-6 z-10">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={sellersSearchQuery}
                      onChange={(e) => setSellersSearchQuery(e.target.value)}
                      placeholder="Search sellers by store name or email..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] placeholder-[#e1dcc9]/20 focus:outline-none focus:border-[#e1dcc9]/40 shadow-inner"
                    />
                  </div>

                  {/* Sellers Directory List */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 relative z-10">
                    {isFetchingSellers && sellersList.length === 0 ? (
                      <div className="flex justify-center items-center py-10">
                        <span className="w-5 h-5 border-2 border-[#412d15] border-t-[#e1dcc9] rounded-full animate-spin" />
                      </div>
                    ) : filteredSellers.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-[#412d15] rounded-xl bg-black/20">
                        <AlertCircle className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground font-light font-sans">No sellers match your search filters.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#412d15]/30 space-y-2">
                        {filteredSellers.map((seller) => (
                          <div 
                            key={seller._id}
                            onClick={() => setSelectedSeller(seller)}
                            className="pt-3 pb-3 px-4 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#412d15]/20 rounded-xl transition-all border border-transparent hover:border-[#412d15]/60"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#1c130b]/30 border border-[#412d15] flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-anton text-[#e1dcc9]/80">
                                  {getInitials(seller.name)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white truncate">
                                  {seller.storeName || seller.name}
                                </h4>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-light">
                                  {seller.name} &bull; {seller.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono uppercase tracking-widest">
                              {seller.isVendorApproved ? (
                                <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded text-[8px]">Approved</span>
                              ) : (
                                <span className="text-amber-400 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded text-[8px] animate-pulse">Pending</span>
                              )}
                              <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#e1dcc9] transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Avatar Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-md rounded-[2.5rem] border border-[#e1dcc9]/10 bg-[#1f150c]/95 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.85)] relative text-left backdrop-blur-md"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#412d15] mb-6">
                <div>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">Profile Picture</span>
                  <h3 className="text-base font-anton tracking-wider text-white uppercase font-black">Select Portrait</h3>
                </div>
                <button onClick={() => setIsAvatarModalOpen(false)} className="text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {PRESETS_AVATARS.map((av, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectAvatarUrl(av.url)}
                      className="cursor-pointer flex flex-col items-center gap-1.5 group"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-[#412d15] group-hover:border-[#e1dcc9] transition-all relative shadow-md">
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity" />
                      </div>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest truncate max-w-full font-mono">{av.name.split(" ")[2]}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#412d15] pt-4">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Custom Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="Paste image link here..."
                      className="flex-1 h-11 px-4 rounded-xl border border-[#412d15] bg-black/55 text-xs text-[#e1dcc9] placeholder-[#e1dcc9]/25 focus:outline-none"
                    />
                    <button 
                      onClick={() => customAvatarUrl.trim() && handleSelectAvatarUrl(customAvatarUrl.trim())}
                      className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black px-4 py-2 rounded-xl shadow-premium"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Seller Profile Modal */}
      <AnimatePresence>
        {selectedSeller && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-md rounded-[2.5rem] border border-[#e1dcc9]/10 bg-[#1f150c]/95 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.85)] relative text-left overflow-y-auto max-h-[85vh] backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start pb-4 border-b border-[#412d15] mb-6">
                <div>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">Seller Details</span>
                  <h3 className="text-base font-anton tracking-wider text-white uppercase font-black">{selectedSeller.storeName || "Private Store"}</h3>
                </div>
                <button onClick={() => setSelectedSeller(null)} className="text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5 text-xs text-[#e1dcc9] font-sans">
                <div className="flex items-center gap-3 bg-black/35 border border-[#412d15] rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-[#1c130b]/30 border border-[#412d15] flex items-center justify-center font-anton text-[#e1dcc9]">
                    {selectedSeller.avatar?.url ? (
                      <img src={selectedSeller.avatar.url} alt="avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{getInitials(selectedSeller.name)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">{selectedSeller.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{selectedSeller.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">Store Location</span>
                  <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-2.5 text-xs text-[#e1dcc9] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#e1dcc9] shrink-0" />
                    {selectedSeller.vendorLocation || "Colaba, Mumbai"}
                  </p>
                </div>

                {selectedSeller.storeDescription && (
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">Store Description</span>
                    <p className="border border-[#412d15] bg-black/55 rounded-xl px-4 py-3 text-xs leading-relaxed text-muted-foreground font-light max-h-[96px] overflow-y-auto scrollbar-thin">
                      {selectedSeller.storeDescription}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1f150c]/15 border border-[#412d15] rounded-xl p-3 text-center">
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Status</span>
                    {selectedSeller.isVendorApproved ? (
                      <span className="text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-semibold">Approved</span>
                    ) : (
                      <span className="text-amber-400 font-mono text-[9px] uppercase tracking-wider font-semibold animate-pulse">Under Review</span>
                    )}
                  </div>
                  <div className="bg-[#1f150c]/15 border border-[#412d15] rounded-xl p-3 text-center">
                    <span className="block text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Account</span>
                    {selectedSeller.isActive ? (
                      <span className="text-blue-400 font-mono text-[9px] uppercase tracking-wider font-semibold">Active</span>
                    ) : (
                      <span className="text-red-400 font-mono text-[9px] uppercase tracking-wider font-semibold">Suspended</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#412d15] pt-5 mt-2 flex flex-col gap-3">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block font-bold">Admin Controls</span>
                  
                  <div className="flex gap-2">
                    {selectedSeller.isVendorApproved ? (
                      <button
                        onClick={() => handleSuspendSeller(selectedSeller._id)}
                        className="flex-1 text-[10px] font-mono uppercase tracking-wider border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 py-2.5 rounded-xl transition-all"
                        disabled={isUpdatingSellerStatus}
                      >
                        Suspend Seller
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveSeller(selectedSeller._id)}
                        className="flex-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e1dcc9] text-black hover:bg-[#c9c4b2] py-2.5 rounded-xl transition-all shadow-premium"
                        disabled={isUpdatingSellerStatus}
                      >
                        Approve Seller
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleSellerActive(selectedSeller._id)}
                      className={`flex-1 text-[10px] font-mono uppercase tracking-wider border py-2.5 rounded-xl transition-all ${
                        selectedSeller.isActive
                          ? "border-[#412d15] text-muted-foreground hover:bg-[#412d15]/30"
                          : "border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      disabled={isUpdatingSellerStatus}
                    >
                      {selectedSeller.isActive ? "Suspend Account" : "Activate Account"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
