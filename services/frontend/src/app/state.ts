"use client";

import { useState, useEffect } from "react";

import { LogModel } from "@/model";
import { getLogs } from "@/api/get-logs.api";
import { createLog, generateLogs, GenerateLogsPayload, getAggregatedLogs, GetAggregatedLogsResponse, GetLogsParameter } from "@/api";
import { downloadLogsAsFile } from "@/api/download-logs.api";
import moment from "moment";

export const usePageState = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [logs, setLogs] = useState<LogModel[]>([]);
  const [aggregatedLogs, setAggregatedLogs] = useState<GetAggregatedLogsResponse | null>(null);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filter, setFilter] = useState<Partial<GetLogsParameter>>({});
  const [sortField, setSortField] = useState<keyof LogModel>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLogData, setNewLogData] = useState<Partial<LogModel> | null>(null);
  const [randomParameters, setRandomParameters] = useState<GenerateLogsPayload>({ count: 100, days_back: 7 });

  // Function to transform logs into chart data
  const processLogsForChart = (logData: LogModel[]) => {
    const groupedLogs: { [date: string]: { [severity: string]: number } } = {};

    logData.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      if (!groupedLogs[date]) {
        groupedLogs[date] = {
          DEBUG: 0,
          INFO: 0,
          WARN: 0,
          ERROR: 0,
          FATAL: 0,
        };
      }
      groupedLogs[date][log.severity]++;
    });

    return Object.entries(groupedLogs).map(([date, severities]) => ({
      date,
      ...severities,
    }));
  };

  // Function to sort logs
  const sortLogs = (logData: LogModel[], field: keyof LogModel, direction: "asc" | "desc") => {
    return [...logData].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Convert timestamps to Date objects for proper comparison
      if (field === "timestamp") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Function to handle column header click for sorting
  const handleSort = (field: keyof LogModel) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Function to get unique sources from logs
  const extractUniqueSources = (logData: LogModel[]) => {
    const sources = Array.from(new Set(logData.map((log) => log.source)));
    setUniqueSources(sources);
  };

  const fetchLogs = async (page: number, pageSize: number, filter: Partial<GetLogsParameter>) => {
    try {
      const response = await getLogs({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...filter,
      });
      const sortedLogs = sortLogs(response.logs, sortField, sortDirection);
      setLogs(sortedLogs);
      setChartData(processLogsForChart(sortedLogs));
      setTotal(response.total);
      extractUniqueSources(response.logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const fetchAggregatedLogs = async (page: number, pageSize: number, filter: Partial<GetLogsParameter>) => {
    try {
      const params: GetLogsParameter = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        severity: filter.severity,
        source: filter.source,
        start_date: filter.start_date,
        end_date: filter.end_date,
      };
      const response = await getAggregatedLogs(params);

      setAggregatedLogs(response);
    } catch (error) {
      console.error("Failed to fetch aggregated logs:", error);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (key: keyof GetLogsParameter, value: string | undefined) => {
    setFilter((prev) => {
      if (value === undefined || value === "") {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  };

  // Function to handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Helper function to get start date from filter
  const getStartDate = (): Date | undefined => {
    return filter.start_date ? new Date(filter.start_date) : undefined;
  };

  // Helper function to get end date from filter
  const getEndDate = (): Date | undefined => {
    return filter.end_date ? new Date(filter.end_date) : undefined;
  };

  // Function to handle start date changes
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const isoDate = moment(date).startOf("day").toISOString();
      handleFilterChange("start_date", isoDate);
    } else {
      handleFilterChange("start_date", undefined);
    }
  };

  // Function to handle end date changes
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const isoDate = moment(date).endOf("day").toISOString();
      handleFilterChange("end_date", isoDate);
    } else {
      handleFilterChange("end_date", undefined);
    }
  };

  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "DEBUG":
        return "text-gray-500";
      case "INFO":
        return "text-blue-600";
      case "WARN":
        return "text-yellow-600";
      case "ERROR":
        return "text-red-600";
      case "FATAL":
        return "text-red-800";
      default:
        return "text-gray-600";
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  const handleDownload = () => {
    downloadLogsAsFile(`logs-${moment().format("YYYYMMDDHHmm")}.csv`, filter).catch((error) => {
      console.error("Failed to download logs:", error);
    });
  };

  const handleClearFilter = () => {
    setFilter({});
    setPage(1);
  };

  const handleCreateNewLog = async () => {
    try {
      await createLog({
        severity: newLogData?.severity as any,
        message: newLogData?.message as string,
        source: newLogData?.source as string,
      });

      setNewLogData(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create new log:", error);
    }

    setPage(1);
    fetchLogs(1, pageSize, filter);
    fetchAggregatedLogs(1, pageSize, filter);
  };

  const handleGenerateRandomLogs = async () => {
    try {
      await generateLogs(randomParameters);

      setNewLogData(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to generate random logs:", error);
    }

    setPage(1);
    fetchLogs(1, pageSize, filter);
    fetchAggregatedLogs(1, pageSize, filter);
  };

  useEffect(() => {
    fetchLogs(page, pageSize, filter);
    fetchAggregatedLogs(page, pageSize, filter);
  }, [page, pageSize, filter, sortField, sortDirection]);

  return {
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
    dialogOpen,
    setDialogOpen,
    newLogData,
    setNewLogData,
    handleCreateNewLog,
    handleGenerateRandomLogs,
  };
};
