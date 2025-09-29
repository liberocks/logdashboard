"use client";

import moment from "moment";
import { ArrowLeft, Edit, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { usePageState } from "./state";
import { getSeverityColor } from "@/lib/severity";

interface LogDetailPageProps {
  params: {
    log_id: string;
  };
}

export default function LogDetailPage({ params }: LogDetailPageProps) {
  const {
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
  } = usePageState(params.log_id);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !log) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="text-lg text-red-600">Error: {error}</div>
          <Button onClick={handleGoBack} variant="outline" className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="text-lg">Log not found</div>
          <Button onClick={handleGoBack} variant="outline" className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <Button onClick={handleGoBack} variant="ghost" className="mb-4 cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Log Details</h1>
            <p className="text-sm text-gray-500">View and edit log entry</p>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button onClick={handleEdit} variant="outline" className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="outline" className="cursor-pointer" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleCancel} variant="outline" className="cursor-pointer" disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="cursor-pointer" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {/* Log ID */}
          <div>
            <Label className="text-sm font-medium">Log ID</Label>
            <div className="mt-1 rounded-md bg-gray-50 p-2 font-mono text-sm">{log.id}</div>
          </div>

          {/* Severity */}
          <div>
            <Label className="text-sm font-medium">Severity</Label>
            {!isEditing ? (
              <div className="mt-1">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(log.severity)}`}>{log.severity}</span>
              </div>
            ) : (
              <Select value={editForm.severity} onValueChange={(value) => handleFieldChange("severity", value)}>
                <SelectTrigger className="mt-1 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {(["DEBUG", "INFO", "WARN", "ERROR", "FATAL"] as const).map((level) => (
                    <SelectItem key={level} value={level} className="cursor-pointer">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(level)}`}>{level}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Message */}
          <div>
            <Label className="text-sm font-medium">Message</Label>
            {!isEditing ? (
              <div className="mt-1 rounded-md bg-gray-50 p-3 text-sm whitespace-pre-wrap">{log.message}</div>
            ) : (
              <textarea
                value={editForm.message}
                onChange={(e) => handleFieldChange("message", e.target.value)}
                className="resize-vertical mt-1 min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-sm"
                placeholder="Enter log message"
              />
            )}
          </div>

          {/* Source */}
          <div>
            <Label className="text-sm font-medium">Source</Label>
            {!isEditing ? (
              <div className="mt-1 rounded-md bg-gray-50 p-2 text-sm">{log.source}</div>
            ) : (
              <Input
                value={editForm.source}
                onChange={(e) => handleFieldChange("source", e.target.value)}
                className="mt-1"
                placeholder="Enter log source"
              />
            )}
          </div>

          {/* Timestamp */}
          <div>
            <Label className="text-sm font-medium">Timestamp</Label>
            <div className="mt-1 rounded-md bg-gray-50 p-2 text-sm">
              {moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
              <span className="ml-2 text-gray-500">({moment(log.timestamp).fromNow()})</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
