export const getSeverityColor = (severity: string) => {
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
