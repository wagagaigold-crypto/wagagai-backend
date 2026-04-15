import { Router } from "express";
import { certificateController as Certificate } from "./certificate.controller";
import { authCheck } from "../../middleware/authentication/verifyJwtToken";
import { limiter } from "../../helper/rateLimiter";

const router = Router();

router.route("/dashboard").get(limiter, Certificate.dashboard);

router.route("/add").post(authCheck(), Certificate.create);

router.route("/edit").post(authCheck(), Certificate.edit);

router.route("/remove").post(authCheck(), Certificate.remove);

router.route("/list").post(authCheck(), Certificate.find);

router.route("/:id").get(limiter, Certificate.findOne);

router.route("/:id/pdf").get(limiter, Certificate.downloadPdf);

export default router;
