import express from "express";
import {
  adminHistoryss,
  createCategory,
  createProduct,
  createTrending,
  deleteOffer,
  deleteTrending,
  forgotPassword,
  getAllCategory,
  getAllUser,
  getDashCount,
  getProduct,
  getProductById,
  getTrending,
  getUserById,
  resetPassword,
  signinAdmin,
  singleAdminHistoryss,
  updateOffer,
  updateTrending,
  verifyResetOTP,
} from "../../controllers/admin/admin.controller.js";
import { getTrendingById } from "../../controllers/user/user.controller.js";

const router = express.Router();

// Admin routes
router.post("/login", signinAdmin);
router.post("/forgotpassword", forgotPassword);
router.post("/verifyresetotp", verifyResetOTP);
router.post("/resetpassword", resetPassword);
router.get("/getusers", getAllUser);
router.get("/getuser/:userid", getUserById);

router.post("/products", createProduct);
router.get("/getProducts", getProduct);
router.post("/getProductbyid", getProductById);
router.post("/updateoffer", updateOffer);
router.post("/deleteoffer", deleteOffer);

router.post("/createTrending", createTrending);
router.get("/getTrending", getTrending);
router.post("/getTrendingbyid", getTrendingById);
router.post("/updateTrending", updateTrending);
router.post("/deleteTrending", deleteTrending);



router.get("/getDashCount", getDashCount);

router.post("/addCategories", createCategory);
router.get("/getAllCategories", getAllCategory);

router.get("/adminHistory", adminHistoryss);
router.post("/singleAdminHistoryss", singleAdminHistoryss);
export default router;
