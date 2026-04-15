import { Router } from "express";
import { authController as Auth } from "./auth.controller";
import { authCheck } from "../../middleware/authentication/verifyJwtToken";
import { avatar } from "../../middleware/multer/multer.config";

const router = Router();

router.route("/signup").post(Auth.signup);

router.route("/signin").post(Auth.signin);

router.route("/verifyOtp").post(Auth.verifyOtp);

router.route("/resendOtp").post(Auth.resendOtp);

router.route("/forgotPassword").post(Auth.forgotPassword);

router.route("/setPassword").post(Auth.setPassword);

router.route("/updatePassword").post(authCheck(), Auth.updatePassword);

router.route("/updateAvatar").post(authCheck(), avatar, Auth.updateAvatar);

router.route("/updateProfile").post(authCheck(), avatar, Auth.updateProfile);

router.route("/profile").get(authCheck(), Auth.getProfile);

export default router;
