import { useCallback, useEffect, useState } from 'react';
import type {
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
} from '@krishnaos/shared-types';
import {
  getUdhyogSaathiBills,
  getUdhyogSaathiDashboard,
  getUdhyogSaathiInventory,
} from '@/lib/apiClient';

interface RuntimeData {
  dashboard: UdhyogSaathiDemoDashboard;
  bills: UdhyogSaathiDemoBill[];
  inventory: UdhyogSaathiDemoInventoryItem[];
}

export function useUdhyogSaathiRuntime() {
  const [dashboard, setDashboard] =
    useState<UdhyogSaathiDemoDashboard | null>(null);

  const [bills, setBills] =
    useState<UdhyogSaathiDemoBill[]>([]);

  const [inventory, setInventory] =
    useState<UdhyogSaathiDemoInventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshError, setRefreshError] =
    useState<string | null>(null);

  const fetchRuntimeData = useCallback(
    async (): Promise<RuntimeData> => {
      const [
        dashboardResponse,
        billsResponse,
        inventoryResponse,
      ] = await Promise.all([
        getUdhyogSaathiDashboard(),
        getUdhyogSaathiBills(),
        getUdhyogSaathiInventory(),
      ]);

      if (!dashboardResponse.success) {
        throw new Error(dashboardResponse.error.message);
      }

      if (!billsResponse.success) {
        throw new Error(billsResponse.error.message);
      }

      if (!inventoryResponse.success) {
        throw new Error(inventoryResponse.error.message);
      }

      return {
        dashboard: dashboardResponse.data,
        bills: billsResponse.data,
        inventory: inventoryResponse.data,
      };
    },
    [],
  );

  const applyRuntimeData = useCallback(
    (data: RuntimeData) => {
      setDashboard(data.dashboard);
      setBills(data.bills);
      setInventory(data.inventory);
    },
    [],
  );

  const syncDashboard = useCallback(async () => {
    try {
      const response = await getUdhyogSaathiDashboard();

      if (!response.success) {
        setRefreshError(response.error.message);
        return;
      }

      setDashboard(response.data);
      setRefreshError(null);
    } catch (syncError) {
      setRefreshError(
        syncError instanceof Error
          ? syncError.message
          : 'Unable to synchronize Udhyog Saathi dashboard.',
      );
    }
  }, []);

  const updateBill = useCallback((bill: UdhyogSaathiDemoBill) => {
    setBills((current) => {
      const exists = current.some((item) => item.id === bill.id);

      return exists
        ? current.map((item) => (item.id === bill.id ? bill : item))
        : [bill, ...current];
    });
  }, []);

  const removeBill = useCallback((id: string) => {
    setBills((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateInventory = useCallback(
    (item: UdhyogSaathiDemoInventoryItem) => {
      setInventory((current) => {
        const exists = current.some((entry) => entry.id === item.id);

        return exists
          ? current.map((entry) => (entry.id === item.id ? item : entry))
          : [item, ...current];
      });
    },
    [],
  );

  const removeInventory = useCallback((id: string) => {
    setInventory((current) =>
      current.filter((item) => item.id !== id),
    );
  }, []);

  const syncRuntime = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);

    try {
      const data = await fetchRuntimeData();
      applyRuntimeData(data);
    } catch (syncError) {
      setRefreshError(
        syncError instanceof Error
          ? syncError.message
          : 'Unable to synchronize Udhyog Saathi.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [applyRuntimeData, fetchRuntimeData]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchRuntimeData();

        if (cancelled) {
          return;
        }

        applyRuntimeData(data);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load Udhyog Saathi.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyRuntimeData, fetchRuntimeData]);

  return {
    dashboard,
    bills,
    inventory,

    loading,
    refreshing,
    error,
    refreshError,

    syncDashboard,
    updateBill,
    removeBill,
    updateInventory,
    removeInventory,
    syncRuntime,
  };
}
