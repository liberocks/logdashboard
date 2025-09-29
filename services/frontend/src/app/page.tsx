"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Download, Dot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { LogModel } from "@/model";
import { getLogs } from "@/api/get-logs.api";
import moment from "moment";
import { getAggregatedLogs, GetAggregatedLogsResponse, GetLogsParameter } from "@/api";
import { SEVERITY_LEVELS } from "@/constants/severity";
import { usePageState } from "./state";

const chartConfig = {
  DEBUG: {
    label: "Debug",
    color: "#6b7280",
  },
  INFO: {
    label: "Info",
    color: "#3b82f6",
  },
  WARN: {
    label: "Warning",
    color: "#f59e0b",
  },
  ERROR: {
    label: "Error",
    color: "#ef4444",
  },
  FATAL: {
    label: "Fatal",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export default function Home() {
  const {
    page,
    setPage,
    pageSize,
    handlePageSizeChange,
    getStartDate,
    getEndDate,
    handleStartDateChange,
    handleEndDateChange,
    logs,
    aggregatedLogs,
    total,
    chartData,
    filter,
    handleFilterChange,
    sortField,
    sortDirection,
    handleSort,
    uniqueSources,
    getSeverityColor,
    totalPages,
    handleDownload,
    handleClearFilter,
  } = usePageState();

  return (
    <>
      <div className="mx-auto max-w-5xl p-4 font-sans">
        <main className="row-start-2 flex w-full flex-col items-center gap-[32px] rounded-lg p-4 sm:items-start">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Log Dashboard</h1>

              <p className="text-sm text-gray-500">Monitor system logs and their severity levels.</p>
            </div>
            <div className="flex flex-row gap-2">
              <Button variant="outline" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add Log
              </Button>
            </div>
          </div>

          <div className="flex w-full flex-row items-center justify-between gap-2">
            <div className="flex-1 rounded border border-gray-300 p-5">
              <div className="text-sm text-gray-500">Total Logs</div>
              <div className="text-xl font-semibold text-gray-600">{total}</div>
            </div>
            <div className="flex-1 rounded border border-gray-300 p-5">
              <div className="text-sm text-gray-500">Total Success</div>
              <div className="text-xl font-semibold text-green-600">
                {(["INFO", "DEBUG"] as Array<keyof typeof chartConfig>).reduce((sum, key) => sum + (aggregatedLogs?.severity_counts[key] || 0), 0)}
              </div>
            </div>
            <div className="flex-1 rounded border border-gray-300 p-5">
              <div className="text-sm text-gray-500">Total Error</div>
              <div className="text-xl font-semibold text-red-600">
                {(["ERROR", "FATAL"] as Array<keyof typeof chartConfig>).reduce((sum, key) => sum + (aggregatedLogs?.severity_counts[key] || 0), 0)}
              </div>
            </div>
          </div>
          <div className="w-full">
            <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => moment(value).format("D MMM YY")} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="DEBUG" fill="var(--color-DEBUG)" radius={1} />
                <Bar dataKey="INFO" fill="var(--color-INFO)" radius={1} />
                <Bar dataKey="WARN" fill="var(--color-WARN)" radius={1} />
                <Bar dataKey="ERROR" fill="var(--color-ERROR)" radius={1} />
                <Bar dataKey="FATAL" fill="var(--color-FATAL)" radius={1} />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Filters */}
          <div className="flex w-full justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Filter by Severity</label>
                <Select value={filter.severity || ""} onValueChange={(value) => handleFilterChange("severity", value === "all" ? undefined : value)}>
                  <SelectTrigger className="w-48 cursor-pointer hover:bg-gray-50">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all" className="cursor-pointer hover:bg-gray-100">
                      All severities
                    </SelectItem>
                    {Object.values(SEVERITY_LEVELS).map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Filter by Source</label>
                <Select value={filter.source || ""} onValueChange={(value) => handleFilterChange("source", value === "all" ? undefined : value)}>
                  <SelectTrigger className="w-48 cursor-pointer hover:bg-gray-50">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All sources</SelectItem>
                    {uniqueSources.map((source) => (
                      <SelectItem key={source} value={source} className="cursor-pointer hover:bg-gray-100">
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DatePicker
                label="Start Date"
                value={getStartDate()}
                onChange={handleStartDateChange}
                placeholder="Select start date"
                id="start-date"
              />
              <DatePicker label="End Date" value={getEndDate()} onChange={handleEndDateChange} placeholder="Select end date" id="end-date" />
            </div>
            <div className="pt-7">
              <Button variant="outline" className="cursor-pointer" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-50" onClick={() => handleSort("timestamp")}>
                    <div className="flex items-center gap-1">
                      Timestamp
                      {sortField === "timestamp" &&
                        (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-50" onClick={() => handleSort("severity")}>
                    <div className="flex items-center gap-1">
                      Severity
                      {sortField === "severity" &&
                        (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-50" onClick={() => handleSort("source")}>
                    <div className="flex items-center gap-1">
                      Source
                      {sortField === "source" && (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-50" onClick={() => handleSort("message")}>
                    <div className="flex items-center gap-1">
                      Message
                      {sortField === "message" && (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getSeverityColor(log.severity)}`}>{log.severity}</span>
                    </TableCell>
                    <TableCell className="font-medium">{log.source}</TableCell>
                    <TableCell className="max-w-md truncate">{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} logs
              </div>
              <Dot className="text-gray-400" />
              <div className="flex flex-row items-center gap-2">
                <label className="text-sm text-gray-500">Logs per page</label>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                  <SelectTrigger className="w-32 cursor-pointer hover:bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="10" className="cursor-pointer hover:bg-gray-100">
                      10
                    </SelectItem>
                    <SelectItem value="25" className="cursor-pointer hover:bg-gray-100">
                      25
                    </SelectItem>
                    <SelectItem value="50" className="cursor-pointer hover:bg-gray-100">
                      50
                    </SelectItem>
                    <SelectItem value="100" className="cursor-pointer hover:bg-gray-100">
                      100
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Dot className="text-gray-400" />
                <Button variant="ghost" className="cursor-pointer" onClick={handleClearFilter}>
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
