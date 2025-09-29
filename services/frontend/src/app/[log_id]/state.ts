"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { deleteLog, getLog, updateLog, UpdateLogPayload } from "@/api";
import { LogModel } from "@/model";

export const usePageState = (logId: string) => {
  const router = useRouter();
  const [log, setLog] = useState<LogModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateLogPayload>({
    severity: "INFO" as any,
    message: "",
    source: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLog(logId);
      setLog(response);

      setEditForm({
        severity: response.severity,
        message: response.message,
        source: response.source,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch log");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof UpdateLogPayload, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!log) return;

    try {
      setSaving(true);
      setError(null);
      const updatedLog = await updateLog(log.id, editForm);
      setLog(updatedLog);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update log");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (log) {
      setEditForm({
        severity: log.severity,
        message: log.message,
        source: log.source,
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!log) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteLog(log.id);

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete log");
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleGoBack = () => {
    router.push("/");
  };

  useEffect(() => {
    if (logId) {
      fetchLog();
    }
  }, [logId]);

  return {
    log,
    loading,
    error,
    isEditing,
    editForm,
    saving,
    deleting,
    handleFieldChange,
    handleSave,
    handleCancel,
    handleDelete,
    handleEdit,
    handleGoBack,
  };
};
