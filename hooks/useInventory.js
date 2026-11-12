"use client";

import { useState, useEffect, useCallback } from "react";

export const INVENTORY_CATEGORIES = [
  "Detergent",
  "Washing Powder",
  "Fabric Conditioner",
  "Laundry Bags",
  "Packaging Materials",
  "Other Supplies",
];

export const INITIAL_INVENTORY_ITEMS = [
  {
    id: "INV-101",
    sku: "DET-LIQ-IND01",
    name: "Industrial Liquid Detergent (Eco-Clean Pro)",
    category: "Detergent",
    currentStock: 145,
    minStockLevel: 50,
    maxStockLevel: 300,
    unit: "Liters",
    unitCost: 85,
    location: "Hub Central - Chem Bay A1",
    supplier: {
      name: "Diversey Chemical Solutions India",
      contactPerson: "Rajeshwar Rao",
      phone: "+91 98140 33441",
      email: "orders@diversey-lpu.in",
      leadTimeDays: 2,
      address: "Focal Point Industrial Area, Phagwara, Punjab",
      gstin: "03AABCD1234E1Z5",
    },
    lastRestocked: "04 Nov 2026",
    stockHistory: [
      {
        id: "hist-101-1",
        date: "04 Nov 2026",
        time: "10:30 AM",
        type: "Restock",
        quantity: 100,
        balanceAfter: 165,
        actor: "Staff Rohit Kumar",
        reason: "Monthly plant delivery - PO #4421",
      },
      {
        id: "hist-101-2",
        date: "06 Nov 2026",
        time: "08:15 AM",
        type: "Usage",
        quantity: -20,
        balanceAfter: 145,
        actor: "Operator Baldev Singh",
        reason: "Shift A washing cycle batch #1 & #2",
      },
    ],
  },
  {
    id: "INV-102",
    sku: "PWD-OXY-HP02",
    name: "Heavy-Duty Washing Powder (Oxy-Power Pro)",
    category: "Washing Powder",
    currentStock: 28,
    minStockLevel: 60,
    maxStockLevel: 250,
    unit: "Kg",
    unitCost: 110,
    location: "Hub Central - Chem Bay A2",
    supplier: {
      name: "Hindustan Commercial Detergents",
      contactPerson: "Sunil Chopra",
      phone: "+91 98721 55662",
      email: "sunil@hcdetergents.com",
      leadTimeDays: 3,
      address: "GT Road Industrial Estate, Jalandhar, Punjab",
      gstin: "03AAEFG9876H2Z1",
    },
    lastRestocked: "28 Oct 2026",
    stockHistory: [
      {
        id: "hist-102-1",
        date: "28 Oct 2026",
        time: "11:00 AM",
        type: "Restock",
        quantity: 80,
        balanceAfter: 95,
        actor: "Staff Rohit Kumar",
        reason: "Emergency replenishment for denim cycles",
      },
      {
        id: "hist-102-2",
        date: "05 Nov 2026",
        time: "02:00 PM",
        type: "Usage",
        quantity: -67,
        balanceAfter: 28,
        actor: "Operator Hardeep Lal",
        reason: "Bedding & heavy blanket batch wash",
      },
    ],
  },
  {
    id: "INV-103",
    sku: "FAB-SFT-COM03",
    name: "Comfort Fabric Conditioner & Softener Blue",
    category: "Fabric Conditioner",
    currentStock: 60,
    minStockLevel: 40,
    maxStockLevel: 180,
    unit: "Liters",
    unitCost: 135,
    location: "Hub North - Dispenser Rack 3",
    supplier: {
      name: "Unilever Professional Supplies",
      contactPerson: "Meenakshi Batra",
      phone: "+91 98223 99881",
      email: "supply@unileverpro-lpu.in",
      leadTimeDays: 2,
      address: "Phase 7 Industrial Area, Mohali, Punjab",
      gstin: "03AAKLP4567M1Z9",
    },
    lastRestocked: "02 Nov 2026",
    stockHistory: [
      {
        id: "hist-103-1",
        date: "02 Nov 2026",
        time: "09:45 AM",
        type: "Restock",
        quantity: 50,
        balanceAfter: 85,
        actor: "Staff Rohit Kumar",
        reason: "Standard weekly softener replenishment",
      },
      {
        id: "hist-103-2",
        date: "06 Nov 2026",
        time: "04:30 PM",
        type: "Usage",
        quantity: -25,
        balanceAfter: 60,
        actor: "Operator Baldev Singh",
        reason: "Delicates & girls hostel batch conditioning",
      },
    ],
  },
  {
    id: "INV-104",
    sku: "BAG-MSH-BH04",
    name: "Heavy-Duty Mesh Laundry Bags (LPU Branded)",
    category: "Laundry Bags",
    currentStock: 340,
    minStockLevel: 150,
    maxStockLevel: 800,
    unit: "Units",
    unitCost: 120,
    location: "Central Intake Counter Storage",
    supplier: {
      name: "Punjab Polytex Bags & Textiles",
      contactPerson: "Amrik Singh",
      phone: "+91 98150 44321",
      email: "amrik@punjabpolytex.in",
      leadTimeDays: 4,
      address: "Transport Nagar, Ludhiana, Punjab",
      gstin: "03AABCP7788R1Z3",
    },
    lastRestocked: "01 Nov 2026",
    stockHistory: [
      {
        id: "hist-104-1",
        date: "01 Nov 2026",
        time: "03:15 PM",
        type: "Restock",
        quantity: 200,
        balanceAfter: 390,
        actor: "Staff Rohit Kumar",
        reason: "New student hostel intake allocation",
      },
      {
        id: "hist-104-2",
        date: "05 Nov 2026",
        time: "11:20 AM",
        type: "Usage",
        quantity: -50,
        balanceAfter: 340,
        actor: "Staff Rohit Kumar",
        reason: "Issued to BH-3 and GH-2 reception desks",
      },
    ],
  },
  {
    id: "INV-105",
    sku: "PKG-GAR-PLY05",
    name: "Garment Poly Wrapping Covers (50 Micron)",
    category: "Packaging Materials",
    currentStock: 45,
    minStockLevel: 100,
    maxStockLevel: 500,
    unit: "Rolls",
    unitCost: 220,
    location: "Packing & Delivery Bay",
    supplier: {
      name: "Supreme Packaging Solutions",
      contactPerson: "Kavita Sethi",
      phone: "+91 98881 22334",
      email: "orders@supremepack.in",
      leadTimeDays: 3,
      address: "Chaheru Industrial Hub, Phagwara, Punjab",
      gstin: "03AAGCS3344T1Z2",
    },
    lastRestocked: "25 Oct 2026",
    stockHistory: [
      {
        id: "hist-105-1",
        date: "25 Oct 2026",
        time: "01:30 PM",
        type: "Restock",
        quantity: 60,
        balanceAfter: 125,
        actor: "Staff Rohit Kumar",
        reason: "Ironed garment cover reorder",
      },
      {
        id: "hist-105-2",
        date: "06 Nov 2026",
        time: "05:00 PM",
        type: "Usage",
        quantity: -80,
        balanceAfter: 45,
        actor: "Packaging Lead Ram Lal",
        reason: "High volume weekend delivery dispatch packaging",
      },
    ],
  },
  {
    id: "INV-106",
    sku: "PKG-TAG-RFID06",
    name: "Waterproof Barcode Garment Identification Tags",
    category: "Packaging Materials",
    currentStock: 1200,
    minStockLevel: 500,
    maxStockLevel: 3000,
    unit: "Units",
    unitCost: 3.5,
    location: "Intake Station 1 & 2 Drawers",
    supplier: {
      name: "Supreme Packaging Solutions",
      contactPerson: "Kavita Sethi",
      phone: "+91 98881 22334",
      email: "orders@supremepack.in",
      leadTimeDays: 3,
      address: "Chaheru Industrial Hub, Phagwara, Punjab",
      gstin: "03AAGCS3344T1Z2",
    },
    lastRestocked: "30 Oct 2026",
    stockHistory: [
      {
        id: "hist-106-1",
        date: "30 Oct 2026",
        time: "10:00 AM",
        type: "Restock",
        quantity: 1500,
        balanceAfter: 1750,
        actor: "Staff Rohit Kumar",
        reason: "Bulk tag replenishment",
      },
      {
        id: "hist-106-2",
        date: "06 Nov 2026",
        time: "06:00 PM",
        type: "Usage",
        quantity: -550,
        balanceAfter: 1200,
        actor: "Intake Operator Priya",
        reason: "Applied to orders LMS1045 through LMS1054",
      },
    ],
  },
  {
    id: "INV-107",
    sku: "OTH-BLR-DSC07",
    name: "Boiler Scale Remover & Acid Treatment Salt",
    category: "Other Supplies",
    currentStock: 14,
    minStockLevel: 25,
    maxStockLevel: 80,
    unit: "Kg",
    unitCost: 195,
    location: "Machinery Maintenance Closet #1",
    supplier: {
      name: "Thermax Boiler Chemical Engineering",
      contactPerson: "Gurinder Sandhu",
      phone: "+91 98765 88990",
      email: "gurinder@thermaxchem.in",
      leadTimeDays: 5,
      address: "Phase 8 Industrial Focal Point, Mohali",
      gstin: "03AABCT9900X1Z4",
    },
    lastRestocked: "20 Oct 2026",
    stockHistory: [
      {
        id: "hist-107-1",
        date: "20 Oct 2026",
        time: "11:30 AM",
        type: "Restock",
        quantity: 30,
        balanceAfter: 44,
        actor: "Maintenance Tech Vikram",
        reason: "Quarterly boiler descaling cycle kit",
      },
      {
        id: "hist-107-2",
        date: "04 Nov 2026",
        time: "03:00 PM",
        type: "Usage",
        quantity: -30,
        balanceAfter: 14,
        actor: "Maintenance Tech Vikram",
        reason: "Main boiler unit #2 flush cycle",
      },
    ],
  },
  {
    id: "INV-108",
    sku: "OTH-STN-SPT08",
    name: "Enzyme Stain Spotting & Collar Treatment Kit",
    category: "Other Supplies",
    currentStock: 35,
    minStockLevel: 20,
    maxStockLevel: 100,
    unit: "Packs",
    unitCost: 160,
    location: "Spotting Station North",
    supplier: {
      name: "Diversey Chemical Solutions India",
      contactPerson: "Rajeshwar Rao",
      phone: "+91 98140 33441",
      email: "orders@diversey-lpu.in",
      leadTimeDays: 2,
      address: "Focal Point Industrial Area, Phagwara, Punjab",
      gstin: "03AABCD1234E1Z5",
    },
    lastRestocked: "03 Nov 2026",
    stockHistory: [
      {
        id: "hist-108-1",
        date: "03 Nov 2026",
        time: "02:15 PM",
        type: "Restock",
        quantity: 25,
        balanceAfter: 45,
        actor: "Staff Rohit Kumar",
        reason: "Spotting chemical replenishment",
      },
      {
        id: "hist-108-2",
        date: "06 Nov 2026",
        time: "01:30 PM",
        type: "Usage",
        quantity: -10,
        balanceAfter: 35,
        actor: "Press Master Ram Lal",
        reason: "Pre-treating tea & ink stains on student uniforms",
      },
    ],
  },
];

let cachedInventory = null;

export function useInventory() {
  const [items, setItems] = useState(() => cachedInventory || INITIAL_INVENTORY_ITEMS);
  const [loading, setLoading] = useState(false);

  const loadStoredInventory = useCallback((force = false) => {
    if (!force && cachedInventory) {
      setItems(cachedInventory);
      return;
    }
    try {
      const stored = localStorage.getItem("lpu_lms_inventory");
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedInventory = parsed;
        setItems(parsed);
      } else {
        cachedInventory = INITIAL_INVENTORY_ITEMS;
        localStorage.setItem(
          "lpu_lms_inventory",
          JSON.stringify(INITIAL_INVENTORY_ITEMS)
        );
        setItems(INITIAL_INVENTORY_ITEMS);
      }
    } catch (e) {
      console.error("Failed to load inventory from storage", e);
      cachedInventory = INITIAL_INVENTORY_ITEMS;
      setItems(INITIAL_INVENTORY_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredInventory();

    const handleStorage = (e) => {
      if (e.key === "lpu_lms_inventory") {
        loadStoredInventory(true);
      }
    };
    const handleCustom = () => loadStoredInventory(true);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lpu_inventory_updated", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lpu_inventory_updated", handleCustom);
    };
  }, [loadStoredInventory]);

  const saveInventory = (newItems) => {
    cachedInventory = newItems;
    setItems(newItems);
    try {
      localStorage.setItem("lpu_lms_inventory", JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent("lpu_inventory_updated"));
    } catch (e) {
      console.error("Failed to save inventory", e);
    }
  };

  const notifyDashboard = (title, desc, type = "inventory") => {
    try {
      const stored = localStorage.getItem("lpu_lms_notifications");
      const list = stored ? JSON.parse(stored) : [];
      const newNotif = {
        id: `notif-${Date.now()}`,
        title,
        desc,
        time: "Just now",
        type,
        unread: true,
        link: "/staff/inventory",
      };
      localStorage.setItem(
        "lpu_lms_notifications",
        JSON.stringify([newNotif, ...list])
      );
      window.dispatchEvent(new CustomEvent("lpu_notifications_updated"));
    } catch (e) {
      console.error("Failed to push inventory notification", e);
    }
  };

  const getTodayTimeStrings = () => {
    const todayStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { todayStr, timeStr };
  };

  // 1. Add new inventory item
  const addItem = (itemData, actor = "Staff Rohit Kumar") => {
    const nextNum =
      items.reduce((max, it) => {
        const n = parseInt(it.id.replace(/\D/g, ""), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 100) + 1;

    const { todayStr, timeStr } = getTodayTimeStrings();
    const newId = `INV-${nextNum}`;

    const newItem = {
      id: newId,
      sku:
        itemData.sku ||
        `${itemData.category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: itemData.name,
      category: itemData.category,
      currentStock: Number(itemData.currentStock) || 0,
      minStockLevel: Number(itemData.minStockLevel) || 30,
      maxStockLevel: Number(itemData.maxStockLevel) || 200,
      unit: itemData.unit || "Units",
      unitCost: Number(itemData.unitCost) || 50,
      location: itemData.location || "Central Storage Rack",
      supplier: itemData.supplier || {
        name: "Standard University Vendor",
        contactPerson: "Store Manager",
        phone: "+91 98000 00000",
        email: "store@lpu.in",
        leadTimeDays: 3,
        address: "LPU Campus Hub, Phagwara",
        gstin: "03AABCL0000X1Z1",
      },
      lastRestocked: todayStr,
      stockHistory: [
        {
          id: `hist-${Date.now()}`,
          date: todayStr,
          time: timeStr,
          type: "Initial",
          quantity: Number(itemData.currentStock) || 0,
          balanceAfter: Number(itemData.currentStock) || 0,
          actor,
          reason: "Initial item creation in inventory system",
        },
      ],
    };

    const updated = [newItem, ...items];
    saveInventory(updated);

    if (newItem.currentStock <= newItem.minStockLevel) {
      notifyDashboard(
        `Low Stock Alert: ${newItem.name}`,
        `Current stock (${newItem.currentStock} ${newItem.unit}) is below the minimum threshold (${newItem.minStockLevel} ${newItem.unit}).`
      );
    }

    return newItem;
  };

  // 2. Quick Stock Update (Restock, Usage, or Adjustment)
  const updateStock = (
    itemId,
    quantityDelta,
    type = "Restock", // 'Restock' | 'Usage' | 'Adjustment'
    reason = "",
    actor = "Staff Rohit Kumar"
  ) => {
    const { todayStr, timeStr } = getTodayTimeStrings();
    let updatedItem = null;

    const updatedList = items.map((it) => {
      if (it.id === itemId) {
        const delta = Number(quantityDelta);
        const newBalance = Math.max(0, it.currentStock + delta);

        const historyEntry = {
          id: `hist-${Date.now()}`,
          date: todayStr,
          time: timeStr,
          type,
          quantity: delta,
          balanceAfter: newBalance,
          actor,
          reason: reason || `${type} transaction of ${Math.abs(delta)} ${it.unit}`,
        };

        updatedItem = {
          ...it,
          currentStock: newBalance,
          lastRestocked: delta > 0 ? todayStr : it.lastRestocked,
          stockHistory: [historyEntry, ...(it.stockHistory || [])],
        };

        // Trigger alert if stock dropped below minimum threshold
        if (newBalance <= it.minStockLevel) {
          notifyDashboard(
            `⚠️ Low Stock Warning: ${it.name}`,
            `Supply level dropped to ${newBalance} ${it.unit} (Minimum threshold: ${it.minStockLevel} ${it.unit}). Please restock.`
          );
        }

        return updatedItem;
      }
      return it;
    });

    saveInventory(updatedList);
    return updatedItem;
  };

  // 3. Edit item details (including Admin configuration of minimum stock level)
  const updateItem = (itemId, updatedFields, actor = "Staff Rohit Kumar") => {
    const { todayStr, timeStr } = getTodayTimeStrings();

    const updatedList = items.map((it) => {
      if (it.id === itemId) {
        const thresholdChanged =
          updatedFields.minStockLevel !== undefined &&
          Number(updatedFields.minStockLevel) !== it.minStockLevel;

        const historyEntry = thresholdChanged
          ? {
              id: `hist-${Date.now()}`,
              date: todayStr,
              time: timeStr,
              type: "Adjustment",
              quantity: 0,
              balanceAfter: it.currentStock,
              actor,
              reason: `Admin updated minimum threshold to ${updatedFields.minStockLevel} ${it.unit}`,
            }
          : null;

        return {
          ...it,
          ...updatedFields,
          currentStock:
            updatedFields.currentStock !== undefined
              ? Number(updatedFields.currentStock)
              : it.currentStock,
          minStockLevel:
            updatedFields.minStockLevel !== undefined
              ? Number(updatedFields.minStockLevel)
              : it.minStockLevel,
          maxStockLevel:
            updatedFields.maxStockLevel !== undefined
              ? Number(updatedFields.maxStockLevel)
              : it.maxStockLevel,
          unitCost:
            updatedFields.unitCost !== undefined
              ? Number(updatedFields.unitCost)
              : it.unitCost,
          stockHistory: historyEntry
            ? [historyEntry, ...(it.stockHistory || [])]
            : it.stockHistory,
        };
      }
      return it;
    });

    saveInventory(updatedList);
  };

  // 4. Remove Inventory Item
  const removeItem = (itemId, actor = "Staff Rohit Kumar") => {
    const itemToDelete = items.find((i) => i.id === itemId);
    const updated = items.filter((i) => i.id !== itemId);
    saveInventory(updated);

    if (itemToDelete) {
      notifyDashboard(
        `Inventory Removed: ${itemToDelete.name}`,
        `Item ${itemToDelete.id} (${itemToDelete.name}) was removed by ${actor}.`
      );
    }
  };

  // 5. Low stock items helper
  const getLowStockItems = () => {
    return items.filter((it) => it.currentStock <= it.minStockLevel);
  };

  // 6. Usage and Valuation Report Helper
  const getInventoryReport = () => {
    const totalValuation = items.reduce(
      (sum, it) => sum + it.currentStock * it.unitCost,
      0
    );
    const lowStockCount = items.filter(
      (it) => it.currentStock <= it.minStockLevel
    ).length;
    const criticalCount = items.filter(
      (it) => it.currentStock <= Math.floor(it.minStockLevel * 0.5)
    ).length;

    // Categorized breakdown
    const categoryBreakdown = INVENTORY_CATEGORIES.map((cat) => {
      const catItems = items.filter((it) => it.category === cat);
      const stockTotal = catItems.reduce(
        (sum, it) => sum + it.currentStock,
        0
      );
      const valTotal = catItems.reduce(
        (sum, it) => sum + it.currentStock * it.unitCost,
        0
      );
      const lowStockInCat = catItems.filter(
        (it) => it.currentStock <= it.minStockLevel
      ).length;

      return {
        category: cat,
        itemCount: catItems.length,
        stockTotal,
        valTotal,
        lowStockInCat,
      };
    });

    return {
      totalItems: items.length,
      totalValuation,
      lowStockCount,
      criticalCount,
      categoryBreakdown,
    };
  };

  return {
    items,
    loading,
    addItem,
    updateStock,
    updateItem,
    removeItem,
    getLowStockItems,
    getInventoryReport,
    categories: INVENTORY_CATEGORIES,
  };
}

