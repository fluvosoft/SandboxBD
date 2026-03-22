import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App | null = null;

/** Handles Vercel/hosting quirks: escaped newlines, accidental wrapping quotes. */
function normalizePrivateKey(raw: string): string {
  let k = raw.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

type ServiceAccountShape = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function loadCredentialFromEnv(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const jsonBlob = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonBlob) {
    let parsed: ServiceAccountShape;
    try {
      parsed = JSON.parse(jsonBlob) as ServiceAccountShape;
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON"
      );
    }
    const projectId = parsed.project_id;
    const clientEmail = parsed.client_email;
    const privateKeyRaw = parsed.private_key;
    if (!projectId || !clientEmail || !privateKeyRaw) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON must include project_id, client_email, and private_key"
      );
    }
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKeyRaw),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Set FIREBASE_SERVICE_ACCOUNT_JSON (full service account JSON) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY on the server"
    );
  }
  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKeyRaw),
  };
}

export function getAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  let cred: { projectId: string; clientEmail: string; privateKey: string };
  try {
    cred = loadCredentialFromEnv();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid Firebase credentials";
    throw new Error(msg);
  }

  try {
    app = initializeApp({
      credential: cert({
        projectId: cred.projectId,
        clientEmail: cred.clientEmail,
        privateKey: cred.privateKey,
      }),
    });
  } catch {
    throw new Error(
      "Firebase Admin could not start (invalid key or credential). Check server env vars."
    );
  }
  return app;
}

export function getReviewsFirestore() {
  getAdminApp();
  return getFirestore();
}

export const REVIEWS_COLLECTION = "startup_reviews";
