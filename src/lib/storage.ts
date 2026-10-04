import fs from "fs";
import path from "path";

export interface FormResponseData {
  formId: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  currentStep: number;
  isSubmitted: boolean;
  answers: Record<string, any>;
  otherAnswers: Record<string, string>;
}

export interface StorageResult {
  success: boolean;
  formId: string;
  revision: number;
  updatedAt: string;
  storageType: "github" | "local";
  message?: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "itstalentnet";
const GITHUB_REPO = process.env.GITHUB_REPO || "talentnet-form";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// Helper: GitHub API request
async function githubRequest(endpoint: string, options: RequestInit = {}) {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "TalentNet-Form-App",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

// Check GitHub credentials and connectivity
export async function testGitHubConnection(): Promise<{
  connected: boolean;
  owner: string;
  repo: string;
  branch: string;
  error?: string;
}> {
  if (!GITHUB_TOKEN) {
    return {
      connected: false,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      error: "متغیر GITHUB_TOKEN در محیط سرور تنظیم نشده است.",
    };
  }

  try {
    const res = await githubRequest(`/branches/${GITHUB_BRANCH}`);
    if (res.ok) {
      return {
        connected: true,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        branch: GITHUB_BRANCH,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        connected: false,
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        branch: GITHUB_BRANCH,
        error: `خطای گیت‌هاب (${res.status}): ${errData.message || res.statusText}`,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      error: err.message || "خطای اتصال به سرور گیت‌هاب",
    };
  }
}

// Get file SHA and content from GitHub if it exists
async function getGitHubFile(filePath: string): Promise<{ sha?: string; content?: any } | null> {
  try {
    const res = await githubRequest(`/contents/${filePath}?ref=${GITHUB_BRANCH}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json();
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return {
      sha: data.sha,
      content: JSON.parse(decoded),
    };
  } catch {
    return null;
  }
}

// Put file to GitHub
async function putGitHubFile(filePath: string, contentObj: any, message: string, sha?: string) {
  const contentBase64 = Buffer.from(JSON.stringify(contentObj, null, 2), "utf-8").toString("base64");
  const body: any = {
    message,
    content: contentBase64,
    branch: GITHUB_BRANCH,
  };
  if (sha) {
    body.sha = sha;
  }

  const res = await githubRequest(`/contents/${filePath}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// Fallback: Local filesystem operations for local development
const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "forms");

function ensureLocalDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function saveLocally(data: FormResponseData): Promise<StorageResult> {
  const formDir = path.join(LOCAL_DATA_DIR, data.formId);
  const versionsDir = path.join(formDir, "versions");
  ensureLocalDir(versionsDir);

  const timestamp = Date.now();
  const versionFile = path.join(versionsDir, `${timestamp}-rev${data.revision}.json`);
  const latestFile = path.join(formDir, "latest.json");

  fs.writeFileSync(versionFile, JSON.stringify(data, null, 2), "utf-8");
  fs.writeFileSync(latestFile, JSON.stringify(data, null, 2), "utf-8");

  return {
    success: true,
    formId: data.formId,
    revision: data.revision,
    updatedAt: data.updatedAt,
    storageType: "local",
    message: "در حافظه محلی ذخیره شد (GITHUB_TOKEN تنظیم نشده است)",
  };
}

// Main save function
export async function saveFormData(
  payload: Omit<FormResponseData, "createdAt" | "updatedAt" | "revision">
): Promise<StorageResult> {
  const { formId } = payload;
  const now = new Date().toISOString();

  // Validate formId
  if (!formId || typeof formId !== "string" || !/^[a-zA-Z0-9_-]{8,64}$/.test(formId)) {
    throw new Error("شناسه فرم نامعتبر است.");
  }

  const latestPath = `data/forms/${formId}/latest.json`;

  if (GITHUB_TOKEN) {
    // 1. Fetch current latest version from GitHub to determine revision and original createdAt
    const existing = await getGitHubFile(latestPath);
    const prevData: FormResponseData | null = existing?.content || null;

    const revision = (prevData?.revision || 0) + 1;
    const createdAt = prevData?.createdAt || now;

    const fullData: FormResponseData = {
      ...payload,
      createdAt,
      updatedAt: now,
      revision,
    };

    // 2. Save version snapshot: data/forms/<formId>/versions/<timestamp>-rev<revision>.json
    const timestamp = Date.now();
    const versionPath = `data/forms/${formId}/versions/${timestamp}-rev${revision}.json`;

    await putGitHubFile(
      versionPath,
      fullData,
      `Form ${formId}: create snapshot rev ${revision}`
    );

    // 3. Save latest: data/forms/<formId>/latest.json
    await putGitHubFile(
      latestPath,
      fullData,
      `Form ${formId}: update latest rev ${revision}`,
      existing?.sha
    );

    return {
      success: true,
      formId,
      revision,
      updatedAt: now,
      storageType: "github",
    };
  } else {
    // Local fallback for local development when token is not present
    let prevData: FormResponseData | null = null;
    const localLatest = path.join(LOCAL_DATA_DIR, formId, "latest.json");
    if (fs.existsSync(localLatest)) {
      try {
        prevData = JSON.parse(fs.readFileSync(localLatest, "utf-8"));
      } catch {
        // ignore
      }
    }

    const revision = (prevData?.revision || 0) + 1;
    const createdAt = prevData?.createdAt || now;

    const fullData: FormResponseData = {
      ...payload,
      createdAt,
      updatedAt: now,
      revision,
    };

    return saveLocally(fullData);
  }
}

// Get form data by ID
export async function getFormData(formId: string): Promise<FormResponseData | null> {
  if (!formId || typeof formId !== "string" || !/^[a-zA-Z0-9_-]{8,64}$/.test(formId)) {
    return null;
  }

  const latestPath = `data/forms/${formId}/latest.json`;

  if (GITHUB_TOKEN) {
    const file = await getGitHubFile(latestPath);
    return file?.content || null;
  } else {
    const localLatest = path.join(LOCAL_DATA_DIR, formId, "latest.json");
    if (fs.existsSync(localLatest)) {
      try {
        return JSON.parse(fs.readFileSync(localLatest, "utf-8"));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// List all forms for admin
export async function listAllForms(): Promise<Array<{ formId: string; updatedAt: string; revision: number; isSubmitted: boolean }>> {
  if (GITHUB_TOKEN) {
    try {
      const res = await githubRequest(`/contents/data/forms?ref=${GITHUB_BRANCH}`);
      if (!res.ok) return [];
      const items = await res.json();
      const results: any[] = [];

      for (const item of items) {
        if (item.type === "dir") {
          const form = await getFormData(item.name);
          if (form) {
            results.push({
              formId: form.formId,
              updatedAt: form.updatedAt,
              revision: form.revision,
              isSubmitted: form.isSubmitted,
            });
          }
        }
      }
      return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  } else {
    if (!fs.existsSync(LOCAL_DATA_DIR)) return [];
    const entries = fs.readdirSync(LOCAL_DATA_DIR, { withFileTypes: true });
    const results: any[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const form = await getFormData(entry.name);
        if (form) {
          results.push({
            formId: form.formId,
            updatedAt: form.updatedAt,
            revision: form.revision,
            isSubmitted: form.isSubmitted,
          });
        }
      }
    }
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}
