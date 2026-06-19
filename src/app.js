import express from "express";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerUi from "swagger-ui-express";
import jwt from "jsonwebtoken";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/notfound.middleware.js";
import config from "./config/env.js";
import { sendTestEmail } from "./services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/**
 * Helmet
 * - Keep CSP disabled in dev to avoid blocking local media.
 * - Allow cross-origin resource loading for images/videos.
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false, // important for media on dev
    crossOriginOpenerPolicy: { policy: "same-origin" },
  }),
);

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Body parsers - skip multipart/form-data (handled by multer)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Note: express.json() and express.urlencoded() automatically skip multipart/form-data
// Multer will handle multipart requests in specific routes

/**
 * CORS Configuration
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "https://sctsinstitute.com",
  "https://www.sctsinstitute.com",
];

function isDevLocalhostOrigin(origin) {
  if (config.nodeEnv !== "development") return false;
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") return false;
    // Vite / other dev servers use arbitrary ports when defaults are taken
    return u.port.length > 0;
  } catch {
    return false;
  }
}

// Add CORS_ORIGIN from env if present (handles comma-separated lists)
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim().replace(/\/$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else if (isDevLocalhostOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * Debug endpoint to check headers
 */
app.get("/__headers", (req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": res.getHeader("Access-Control-Allow-Origin"),
    "Cross-Origin-Resource-Policy": res.getHeader(
      "Cross-Origin-Resource-Policy",
    ),
    "Cross-Origin-Embedder-Policy": res.getHeader(
      "Cross-Origin-Embedder-Policy",
    ),
    "Request-Origin": req.get("origin"),
    "CORS-Origin-Config": config.corsOrigin,
  };
  res.json(headers);
});

/**
 * Global token interception middleware
 * Checks for a valid Bearer token on every request, verifying and attaching it to res.locals.accessToken
 * to ensure that authenticated requests receive the token in all success/failure responses.
 */
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      req.user = decoded;
      res.locals.accessToken = token;
    } catch (err) {
      // Proceed without failing so that public endpoints remain accessible
    }
  }
  next();
});

/**
 * API routes
 */
app.use("/api", routes);

/**
 * Health endpoint
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Root endpoint - health/status
 */
app.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "sctsinstitute-backenddddddd" });
});

// ===== Test email (SMTP check) START =====
// GET /test-email?to=you@example.com
// In production, also: &secret=YOUR_TEST_EMAIL_SECRET (set TEST_EMAIL_SECRET in env)
app.get("/test-email", async (req, res) => {
  const to = typeof req.query.to === "string" ? req.query.to.trim() : "";
  if (!to) {
    return res.status(400).json({
      ok: false,
      error: "Add query param: ?to=your-email@example.com",
    });
  }
  const secret = process.env.TEST_EMAIL_SECRET;
  if (config.nodeEnv === "production") {
    if (!secret) {
      return res.status(403).json({
        ok: false,
        error: "Test route disabled in production (set TEST_EMAIL_SECRET to enable).",
      });
    }
    if (req.query.secret !== secret) {
      return res.status(403).json({ ok: false, error: "Invalid or missing secret query param." });
    }
  }
  const result = await sendTestEmail({ to });
  if (result.ok) {
    return res.status(200).json({
      ok: true,
      message: "Email sent",
      messageId: result.messageId,
      to,
    });
  }
  return res.status(500).json({ ok: false, error: result.error });
});
// ===== Test email (SMTP check) END =====

// ===== Swagger (NON-BREAKING ADDON) START =====
app.set("trust proxy", 1);
const openApiPath = join(__dirname, "..", "docs", "openapi.json");
app.get("/openapi.json", (req, res) => {
  const baseUrl =
    (process.env.PUBLIC_BASE_URL || "").trim().replace(/\/$/, "") ||
    `${req.get("x-forwarded-proto") || req.protocol}://${req.get("x-forwarded-host") || req.get("host")}` ||
    `http://localhost:${process.env.PORT || 8080}`;
  let spec = {};
  if (fs.existsSync(openApiPath)) {
    spec = JSON.parse(fs.readFileSync(openApiPath, "utf8"));
  }
  spec.servers = [{ url: baseUrl, description: "API Server" }];
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(spec));
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: "/openapi.json" } }),
);
// ===== Swagger (NON-BREAKING ADDON) END =====

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
