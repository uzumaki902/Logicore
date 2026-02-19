"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
async function main() {
    dotenv_1.default.config();
    const app = (0, express_1.default)();
    const allowedOrigins = (process.env.FRONTEND_URLS ??
        process.env.FRONTEND_URL ??
        "http://localhost:5173,http://localhost:5175")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    app.use((0, cors_1.default)({
        origin(origin, callback) {
            // Allow non-browser clients (no Origin header)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.get("/status", (req, res) => {
        res.json({ ok: "true", status: "UP" });
    });
    app.use("/auth", auth_routes_1.default);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
main().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
