import { Router } from "express";
import Auth from "./auth/auth.route";
import Certificate from "./certificate/certificate.router";

const router = Router();

router.use("/auth", Auth);

router.use("/certificate", Certificate);

export default router;
