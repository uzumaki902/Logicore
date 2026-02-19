"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_1 = require("@scalekit-sdk/node");
const crypto_1 = __importDefault(require("crypto"));
const cookie_1 = require("./cookie");
const auth_middleware_1 = require("./auth.middleware");
const cookie_2 = require("./cookie");
const router = (0, express_1.Router)();
function extractEnv(key) {
    const getVal = process.env[key];
    if (!getVal)
        throw new Error(`Missing env, ${key}`);
    return getVal;
}
function makeScalekit() {
    return new node_1.ScalekitClient(extractEnv("SCALEKIT_ENVIRONMENT_URL"), extractEnv("SCALEKIT_CLIENT_ID"), extractEnv("SCALEKIT_CLIENT_SECRET"));
}
function getQueryString(value) {
    if (typeof value === "string")
        return value;
    return undefined;
}
function stateCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
    };
}
router.get("/login", (req, res) => {
    try {
        const scalekit = makeScalekit();
        const state = crypto_1.default.randomBytes(16).toString("hex");
        res.cookie("sp_oauth_state", state, stateCookieOptions());
        const redirectUri = `${extractEnv("BACKEND_URL")}/auth/callback`;
        const authorizationUrl = scalekit.getAuthorizationUrl(redirectUri, {
            state,
            scopes: ["openid", "profile", "email"],
        });
        res.redirect(authorizationUrl);
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});
router.get("/callback", async (req, res) => {
    try {
        const code = getQueryString(req.query.code);
        const state = getQueryString(req.query.state);
        const error = getQueryString(req.query.error);
        if (error) {
            return res.redirect(`${extractEnv("FRONTEND_URL")}/login?error=${encodeURIComponent(error)}`);
        }
        if (!code || !state) {
            return res.status(400).send("Missing code or state");
        }
        const expectedState = req.cookies["sp_oauth_state"];
        if (!expectedState || expectedState !== state) {
            return res.status(400).send("Invalid state");
        }
        res.clearCookie("sp_oauth_state", stateCookieOptions());
        const scalekit = makeScalekit();
        const redirectUri = `${extractEnv("BACKEND_URL")}/auth/callback`;
        const authResult = await scalekit.authenticateWithCode(code, redirectUri);
        console.log(authResult, code, "authResult");
        if (!authResult.user) {
            return res.status(500).send("user info is missing");
        }
        (0, cookie_1.setSessionCookie)(res, {
            id: authResult.user.id,
            email: authResult.user.email,
            name: authResult.user.name,
        });
        return res.redirect(`${extractEnv("FRONTEND_URL")}/support`);
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Callback error" });
    }
});
router.get("/me", auth_middleware_1.requireAuth, (req, res) => {
    res.json({
        user: req.user.id,
        email: req.user.email,
        name: req.user.name,
    });
});
router.post("/logout", auth_middleware_1.requireAuth, (req, res) => {
    (0, cookie_2.clearSessionCookie)(res);
    res.json({ ok: true });
});
exports.default = router;
