import fs from "fs";
import path from "path";
import { getDb } from "./db";

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
  storageType: "database" | "github" | "local";
  message?: string;
  syncedToGit?: boolean;
}

// Dynamically read environment variables on each request
function getGitHubConfig() {
  return {
    token: process.env.GITHUB_TOKEN?.trim(),
    owner: process.env.GITHUB_OWNER?.trim() || "itstalentnet",
    repo: process.env.GITHUB_REPO?.trim() || "talentnet-form",
    branch: process.env.GITHUB_BRANCH?.trim() || "main",
  };
}

// Helper: GitHub API request
async function githubRequest(endpoint: string, options: RequestInit = {}) {
  const { token, owner, repo } = getGitHubConfig();

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "TalentNet-Form-App",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    cache: "no-store",
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
  const { token, owner, repo, branch } = getGitHubConfig();

  if (!token) {
    return {
      connected: false,
      owner,
      repo,
      branch,
      error: "متغیر GITHUB_TOKEN در فایل .env.local یا محیط سرور تنظیم نشده است.",
    };
  }

  try {
    const res = await githubRequest(`/branches/${branch}`);
    if (res.ok) {
      return {
        connected: true,
        owner,
        repo,
        branch,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        connected: false,
        owner,
        repo,
        branch,
        error: `خطای دسترسی گیت‌هاب (${res.status}): ${errData.message || res.statusText}`,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      owner,
      repo,
      branch,
      error: err.message || "خطای اتصال به سرور گیت‌هاب",
    };
  }
}

// Get file SHA and content from GitHub if it exists
async function getGitHubFile(filePath: string): Promise<{ sha?: string; content?: any } | null> {
  const { branch } = getGitHubConfig();
  try {
    const res = await githubRequest(`/contents/${filePath}?ref=${branch}`);
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
  const { branch } = getGitHubConfig();
  const contentBase64 = Buffer.from(JSON.stringify(contentObj, null, 2), "utf-8").toString("base64");
  const body: any = {
    message,
    content: contentBase64,
    branch,
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

// Local filesystem fallback & backup
const LOCAL_DATA_DIR = path.join(process.cwd(), "data", "forms");

function ensureLocalDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveLocalFileBackup(data: FormResponseData) {
  try {
    const formDir = path.join(LOCAL_DATA_DIR, data.formId);
    const versionsDir = path.join(formDir, "versions");
    ensureLocalDir(versionsDir);

    const timestamp = Date.now();
    const versionFile = path.join(versionsDir, `${timestamp}-rev${data.revision}.json`);
    const latestFile = path.join(formDir, "latest.json");

    fs.writeFileSync(versionFile, JSON.stringify(data, null, 2), "utf-8");
    fs.writeFileSync(latestFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local file backup error:", err);
  }
}

// Sync final submitted form to GitHub (Only called on final submission)
async function syncFinalVersionToGitHub(fullData: FormResponseData): Promise<boolean> {
  const { token } = getGitHubConfig();
  if (!token) return false;

  try {
    const latestPath = `data/forms/${fullData.formId}/latest.json`;
    const existing = await getGitHubFile(latestPath);

    // Save final version snapshot
    const timestamp = Date.now();
    const versionPath = `data/forms/${fullData.formId}/versions/${timestamp}-rev${fullData.revision}.json`;

    await putGitHubFile(
      versionPath,
      fullData,
      `Form ${fullData.formId}: save submitted snapshot rev ${fullData.revision}`
    );

    // Save latest
    await putGitHubFile(
      latestPath,
      fullData,
      `Form ${fullData.formId}: save submitted final rev ${fullData.revision}`,
      existing?.sha
    );

    return true;
  } catch (err: any) {
    console.error("Failed to sync final version to GitHub:", err?.message || err);
    return false;
  }
}

// Main save function: Primary storage is SQLite Database on Server
export async function saveFormData(
  payload: Omit<FormResponseData, "createdAt" | "updatedAt" | "revision">
): Promise<StorageResult> {
  const { formId } = payload;
  const now = new Date().toISOString();

  // Validate formId
  if (!formId || typeof formId !== "string" || !/^[a-zA-Z0-9_-]{6,64}$/.test(formId)) {
    throw new Error("شناسه فرم نامعتبر است.");
  }

  const db = getDb();

  // Check previous record in DB
  const prevRow: any = db
    .prepare("SELECT revision, created_at FROM forms WHERE form_id = ?")
    .get(formId);

  const revision = (prevRow?.revision || 0) + 1;
  const createdAt = prevRow?.created_at || now;

  const fullData: FormResponseData = {
    ...payload,
    createdAt,
    updatedAt: now,
    revision,
  };

  // 1. Save into Server SQLite Database (Instant & Atomic)
  const upsert = db.prepare(`
    INSERT INTO forms (form_id, revision, current_step, is_submitted, answers, other_answers, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(form_id) DO UPDATE SET
      revision = excluded.revision,
      current_step = excluded.current_step,
      is_submitted = excluded.is_submitted,
      answers = excluded.answers,
      other_answers = excluded.other_answers,
      updated_at = excluded.updated_at
  `);

  upsert.run(
    fullData.formId,
    fullData.revision,
    fullData.currentStep,
    fullData.isSubmitted ? 1 : 0,
    JSON.stringify(fullData.answers || {}),
    JSON.stringify(fullData.otherAnswers || {}),
    fullData.createdAt,
    fullData.updatedAt
  );

  // 2. Save snapshot in database
  const insertSnapshot = db.prepare(`
    INSERT INTO form_snapshots (form_id, revision, current_step, is_submitted, answers, other_answers, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertSnapshot.run(
    fullData.formId,
    fullData.revision,
    fullData.currentStep,
    fullData.isSubmitted ? 1 : 0,
    JSON.stringify(fullData.answers || {}),
    JSON.stringify(fullData.otherAnswers || {}),
    fullData.updatedAt
  );

  // 3. Local JSON file backup
  saveLocalFileBackup(fullData);

  // 4. ONLY send to GitHub if the form is fully SUBMITTED (isSubmitted === true)
  // Intermediate auto-saves are kept on the server to prevent GitHub rate-limits!
  let syncedToGit = false;
  if (fullData.isSubmitted) {
    syncedToGit = await syncFinalVersionToGitHub(fullData);
  }

  return {
    success: true,
    formId,
    revision,
    updatedAt: now,
    storageType: "database",
    syncedToGit,
    message: fullData.isSubmitted
      ? (syncedToGit ? "با موفقیت در دیتابیس ثبت و نسخه نهایی به گیت ارسال شد." : "در دیتابیس سرور با موفقیت ثبت نهایی شد.")
      : "در دیتابیس سرور ذخیره شد.",
  };
}

// Get form data by ID
export async function getFormData(formId: string): Promise<FormResponseData | null> {
  if (!formId || typeof formId !== "string" || !/^[a-zA-Z0-9_-]{6,64}$/.test(formId)) {
    return null;
  }

  // 1. Check SQLite Database first (sub-millisecond)
  try {
    const db = getDb();
    const row: any = db.prepare("SELECT * FROM forms WHERE form_id = ?").get(formId);
    if (row) {
      return {
        formId: row.form_id,
        revision: row.revision,
        currentStep: row.current_step,
        isSubmitted: Boolean(row.is_submitted),
        answers: JSON.parse(row.answers || "{}"),
        otherAnswers: JSON.parse(row.other_answers || "{}"),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
  } catch (err) {
    console.error("Database query error in getFormData:", err);
  }

  // 2. Check Local File Backup
  const localLatest = path.join(LOCAL_DATA_DIR, formId, "latest.json");
  if (fs.existsSync(localLatest)) {
    try {
      return JSON.parse(fs.readFileSync(localLatest, "utf-8"));
    } catch {
      // ignore
    }
  }

  // 3. Check GitHub fallback
  const { token } = getGitHubConfig();
  if (token) {
    const file = await getGitHubFile(`data/forms/${formId}/latest.json`);
    return file?.content || null;
  }

  return null;
}

// List all forms for admin
export async function listAllForms(): Promise<
  Array<{ formId: string; updatedAt: string; revision: number; isSubmitted: boolean }>
> {
  // 1. Read from SQLite Database
  try {
    const db = getDb();
    const rows: any[] = db
      .prepare(
        "SELECT form_id, updated_at, revision, is_submitted FROM forms ORDER BY updated_at DESC"
      )
      .all();

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        formId: r.form_id,
        updatedAt: r.updated_at,
        revision: r.revision,
        isSubmitted: Boolean(r.is_submitted),
      }));
    }
  } catch (err) {
    console.error("Database query error in listAllForms:", err);
  }

  // 2. Fallback to Local Files
  if (fs.existsSync(LOCAL_DATA_DIR)) {
    try {
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
      if (results.length > 0) {
        return results.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback to GitHub
  const { token, branch } = getGitHubConfig();
  if (token) {
    try {
      const res = await githubRequest(`/contents/data/forms?ref=${branch}`);
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
      return results.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch {
      return [];
    }
  }

  return [];
}

// Delete a form completely from SQLite database and local disk
export async function deleteFormData(formId: string): Promise<{ success: boolean; message: string }> {
  if (!formId || typeof formId !== "string" || !/^[a-zA-Z0-9_-]{6,64}$/.test(formId)) {
    throw new Error("شناسه فرم نامعتبر است.");
  }

  // 1. Delete from SQLite database
  try {
    const db = getDb();
    db.prepare("DELETE FROM forms WHERE form_id = ?").run(formId);
    db.prepare("DELETE FROM form_snapshots WHERE form_id = ?").run(formId);
  } catch (err) {
    console.error("Error deleting from SQLite:", err);
  }

  // 2. Delete from local disk
  try {
    const formDir = path.join(LOCAL_DATA_DIR, formId);
    if (fs.existsSync(formDir)) {
      fs.rmSync(formDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error("Error deleting local form folder:", err);
  }

  // 3. If token is configured, also attempt to delete from GitHub
  const { token, branch } = getGitHubConfig();
  if (token) {
    try {
      const latestPath = `data/forms/${formId}/latest.json`;
      const existing = await getGitHubFile(latestPath);
      if (existing?.sha) {
        await githubRequest(`/contents/${latestPath}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Form ${formId}: deleted from admin panel`,
            sha: existing.sha,
            branch,
          }),
        });
      }
    } catch (err) {
      console.warn("GitHub deletion warning:", err);
    }
  }

  return { success: true, message: `فرم ${formId} با موفقیت از دیتابیس و سرور حذف شد.` };
}
