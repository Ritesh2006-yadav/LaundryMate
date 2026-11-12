"use client";

import { useState, useEffect } from "react";
import { LAUNDRY_SERVICES as DEFAULT_SERVICES } from "@/lib/constants";

let cachedServices = null;

export function useLaundryServices() {
  const [services, setServices] = useState(() => cachedServices || DEFAULT_SERVICES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cachedServices) return;
    try {
      const stored = localStorage.getItem("lpu_lms_services");
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedServices = parsed;
        setServices(parsed);
      } else {
        cachedServices = DEFAULT_SERVICES;
        localStorage.setItem("lpu_lms_services", JSON.stringify(DEFAULT_SERVICES));
      }
    } catch (e) {
      console.error("Failed to load services from localStorage", e);
    }
  }, []);

  const saveServices = (newServices) => {
    cachedServices = newServices;
    setServices(newServices);
    try {
      localStorage.setItem("lpu_lms_services", JSON.stringify(newServices));
    } catch (e) {
      console.error("Failed to save services", e);
    }
  };

  const updateService = (serviceId, updatedFields) => {
    const updated = services.map((svc) => {
      if (svc.id === serviceId) {
        return { ...svc, ...updatedFields };
      }
      return svc;
    });
    saveServices(updated);
    return updated;
  };

  const addService = (newService) => {
    const serviceWithId = {
      ...newService,
      id: newService.id || `svc-${Date.now()}`,
      unit: "/kg",
    };
    const updated = [...services, serviceWithId];
    saveServices(updated);
    return serviceWithId;
  };

  const resetToDefaults = () => {
    saveServices(DEFAULT_SERVICES);
  };

  return {
    services,
    loading,
    updateService,
    addService,
    resetToDefaults,
  };
}

