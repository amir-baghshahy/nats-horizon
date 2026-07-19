import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  CheckCircle,
  Globe,
  Mail,
  Shield,
  RefreshCw,
} from "lucide-react";
import PanelCard from "../../components/ui/PanelCard";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import PageHeader from "../../components/ui/PageHeader";
import { PageLoading } from "../../components/ui/PageState";
import { ConfigService, TenancyService, HealthService } from "../../types";

interface ConfigData {
  nats_url: string;
  gin_mode: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_from: string;
  cors_allowed_origins: string;
}

interface TestResult {
  healthy?: boolean;
  error?: string;
}

const RESTART_KEY = "nats-setup-restarting";

// Helper: Poll health endpoint until server is ready
async function pollServerHealth(maxAttempts: number = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const response = await HealthService.getHealth();
      if (response) {
        localStorage.removeItem(RESTART_KEY);
        return true;
      }
    } catch {
      // Server not ready yet
    }
  }
  localStorage.removeItem(RESTART_KEY);
  return false;
}

// Helper: Default config values
function getDefaultConfig(): ConfigData {
  return {
    nats_url: "nats://localhost:4222",
    gin_mode: "release",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_from: "",
    cors_allowed_origins: "*",
  };
}

// Helper: Transform API config data to local state
function transformConfigData(data: any): ConfigData {
  return {
    nats_url: data.nats_url ?? "nats://localhost:4222",
    gin_mode: data.gin_mode ?? "release",
    smtp_host: data.smtp_host ?? "",
    smtp_port: data.smtp_port ?? 587,
    smtp_username: data.smtp_username ?? "",
    smtp_password: data.smtp_password ?? "",
    smtp_from: data.smtp_from ?? "",
    cors_allowed_origins: data.cors_allowed_origins ?? "*",
  };
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [restarting, setRestarting] = useState(() => {
    return localStorage.getItem(RESTART_KEY) === "true";
  });
  const [originalNatsUrl, setOriginalNatsUrl] = useState("");
  const [config, setConfig] = useState<ConfigData>(getDefaultConfig);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await ConfigService.getConfig();
        const transformedConfig = transformConfigData(data);
        setConfig(transformedConfig);
        setOriginalNatsUrl(transformedConfig.nats_url);
      } catch {
        setError(t("settings.loadError"));
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [t]);

  useEffect(() => {
    if (restarting) {
      pollServerHealth().then((success) => {
        if (success) {
          window.location.reload();
        } else {
          setRestarting(false);
          setError("settings.restartTimeout");
        }
      });
    }
  }, [restarting]);

  const updateField = useCallback((field: keyof ConfigData, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (field === "nats_url") {
      setTestResult(null);
    }
  }, []);

  const handleTestConnection = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    setError("");

    try {
      const data = await TenancyService.postTenancyConnectionsTest({
        url: config.nats_url,
      });

      if (data.healthy) {
        setTestResult({ healthy: true });
      } else {
        setTestResult({
          healthy: false,
          error: data.error || t("settings.testFailed"),
        });
      }
    } catch {
      setTestResult({ healthy: false, error: t("settings.testFailed") });
    } finally {
      setTesting(false);
    }
  }, [config.nats_url, t]);

  const handleSave = useCallback(async () => {
    const natsUrlChanged = config.nats_url !== originalNatsUrl;

    if (natsUrlChanged) {
      if (!testResult?.healthy) {
        setError("settings.testRequired");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await ConfigService.putConfig(config);

      setSuccess("settings.saved");

      setRestarting(true);
      localStorage.setItem(RESTART_KEY, "true");
      try {
        await ConfigService.postConfigRestart();
      } catch {
        // Ignore - connection will drop during restart
      }
    } catch {
      setError("settings.saveFailed");
    } finally {
      setSaving(false);
    }
  }, [config.nats_url, originalNatsUrl, testResult]);

  if (restarting) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <div className="animate-spin icon-lg border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-display-xl font-bold text-content-primary">
            {t("settings.restarting")}
          </h2>
          <p className="text-display-sm text-content-tertiary">
            {t("settings.restartingDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageLoading text={t("settings.loading")} />;
  }

  const natsUrlChanged = config.nats_url !== originalNatsUrl;
  const canSave = !natsUrlChanged || testResult?.healthy;

  const getErrorMessage = (key: string) => {
    if (key.startsWith("settings.")) return t(key);
    return key;
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 md:h-full md:overflow-hidden">
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        icon={SettingsIcon}
        actions={
          <Button
            variant="primary"
            icon={<Save className="icon-base" />}
            onClick={handleSave}
            loading={saving}
            disabled={!canSave}
          >
            {t("settings.save")}
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-display-sm">
          <AlertCircle className="icon-base flex-shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-display-sm">
          <CheckCircle className="icon-base flex-shrink-0" />
          <span>{getErrorMessage(success)}</span>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 scrollbar-thin">
        <PanelCard
          header={
            <h3 className="text-display-lg font-semibold flex items-center gap-2">
              <Globe className="icon-md" /> {t("settings.connection")}
            </h3>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.natsUrl")}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.nats_url}
                  onChange={(e) => updateField("nats_url", e.target.value)}
                  placeholder="nats://localhost:4222"
                  className="input flex-1"
                />
                <Button
                  variant="secondary"
                  icon={<RefreshCw className="icon-base" />}
                  onClick={handleTestConnection}
                  loading={testing}
                  disabled={testing}
                >
                  {t("settings.testConnection")}
                </Button>
              </div>
              {testResult && (
                <div
                  className={`mt-2 p-2 rounded-lg text-display-sm flex items-center gap-2 ${
                    testResult.healthy
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {testResult.healthy ? (
                    <>
                      <CheckCircle className="icon-sm" />
                      <span>{t("settings.testSuccessful")}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="icon-sm" />
                      <span>
                        {testResult.error || t("settings.testFailed")}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </PanelCard>

        <PanelCard
          header={
            <h3 className="text-display-lg font-semibold flex items-center gap-2">
              <Shield className="icon-md" /> {t("settings.server")}
            </h3>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.ginMode")}
              </label>
              <Select
                value={config.gin_mode}
                onChange={(value) => updateField("gin_mode", value)}
                options={[
                  { value: "debug", label: t("settings.ginModeDebug") },
                  { value: "release", label: t("settings.ginModeRelease") },
                  { value: "test", label: t("settings.ginModeTest") },
                ]}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.corsOrigins")}
              </label>
              <input
                type="text"
                value={config.cors_allowed_origins}
                onChange={(e) =>
                  updateField("cors_allowed_origins", e.target.value)
                }
                placeholder="*"
                className="input w-full"
              />
            </div>
          </div>
        </PanelCard>

        <PanelCard
          header={
            <h3 className="text-display-lg font-semibold flex items-center gap-2">
              <Mail className="icon-md" /> {t("settings.email")}
            </h3>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.smtpHost")}
              </label>
              <input
                type="text"
                value={config.smtp_host}
                onChange={(e) => updateField("smtp_host", e.target.value)}
                placeholder="smtp.example.com"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.smtpPort")}
              </label>
              <input
                type="number"
                value={config.smtp_port}
                onChange={(e) =>
                  updateField("smtp_port", parseInt(e.target.value) || 587)
                }
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.smtpUsername")}
              </label>
              <input
                type="text"
                value={config.smtp_username}
                onChange={(e) => updateField("smtp_username", e.target.value)}
                placeholder="user@example.com"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.smtpPassword")}
              </label>
              <input
                type="password"
                value={config.smtp_password}
                onChange={(e) => updateField("smtp_password", e.target.value)}
                placeholder="••••••••"
                className="input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-display-sm font-medium mb-2 text-content-primary">
                {t("settings.smtpFrom")}
              </label>
              <input
                type="text"
                value={config.smtp_from}
                onChange={(e) => updateField("smtp_from", e.target.value)}
                placeholder="noreply@example.com"
                className="input w-full"
              />
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
