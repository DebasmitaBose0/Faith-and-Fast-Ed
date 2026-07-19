export const healthConfig = {
  monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || "300000", 10),
  memoryThreshold: parseInt(process.env.MEMORY_THRESHOLD || "90", 10),
  cpuThreshold: parseInt(process.env.CPU_THRESHOLD || "80", 10),
  healthEndpoint: "/api/health",
  readinessEndpoint: "/api/readiness",
};

export default healthConfig;
