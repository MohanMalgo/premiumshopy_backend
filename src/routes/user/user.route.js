import express from "express";
import { verifyUserAuthToken } from "../../services/helper.js";

import {
  getOffers,
  buyticket,
  userContactUs,
  addBankDetails,
  deleteAccount,
  getBankDetails,
  getOfferDetails,
  getSingleOfferDetails,
  getProducts,
  getAllCategories,
  getProductById,
  createBillingDetails,
  getAllTrendingProducts,
  getTrendingById,
  confirmPurchase,
} from "../../controllers/user/user.controller.js";

const router = express.Router();
router.get("/auth/getoffer",verifyUserAuthToken,getOffers)
router.post("/auth/buytickets",buyticket)
// =================
router.post('/userContactUs',userContactUs)
router.get("/getProducts", getProducts);
router.post("/getProductbyid", getProductById);

router.get("/getTrending", getAllTrendingProducts);
router.post("/getTrendingbyid", getTrendingById);



router.get("/getCategory", getAllCategories);
router.post("/addBilling", createBillingDetails);
router.post('/confirmPurchase',confirmPurchase)




// =================
router.get("/getOffers", getOfferDetails);
router.post("/getSingleOffers",getSingleOfferDetails);


router.get('/auth/getBankDetails',verifyUserAuthToken,getBankDetails )
router.post('/auth/addBankDetails',verifyUserAuthToken,addBankDetails)
router.get('/auth/deleteAccount',verifyUserAuthToken,deleteAccount)

export default router;





