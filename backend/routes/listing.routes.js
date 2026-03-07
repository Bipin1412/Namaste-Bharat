const express = require("express");
const {
  home,
  categories,
  businesses,
  businessById,
  createBusinessHandler,
  updateBusinessHandler,
  adminListings,
  activateListingHandler,
  rejectListingHandler,
  deleteBusinessHandler,
  reels,
  offers,
  leads,
  createLeadHandler,
  reviews,
  createReviewHandler,
  sellerAnalytics,
  dailyInquiries,
  createDailyInquiryHandler,
  adminDailyInquiries,
  deleteDailyInquiryHandler,
} = require("../controllers/listing.controller");
const { requireAuth, optionalAuth, requireAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/home", home);
router.get("/categories", categories);

router.get("/businesses", businesses);
router.get("/businesses/:id", businessById);
router.post("/businesses", createBusinessHandler);
router.patch("/businesses/:id", requireAuth, requireAdmin, updateBusinessHandler);
router.delete("/businesses/:id", requireAuth, requireAdmin, deleteBusinessHandler);

router.get("/reels", reels);
router.get("/offers", offers);

router.get("/leads", leads);
router.post("/leads", createLeadHandler);

router.get("/reviews", reviews);
router.post("/reviews", optionalAuth, createReviewHandler);
router.get("/daily-inquiries", dailyInquiries);

router.get("/seller/analytics", requireAuth, sellerAnalytics);

router.get("/admin/listings", requireAuth, requireAdmin, adminListings);
router.patch("/admin/listings/:id/activate", requireAuth, requireAdmin, activateListingHandler);
router.patch("/admin/listings/:id/reject", requireAuth, requireAdmin, rejectListingHandler);
router.get("/admin/daily-inquiries", requireAuth, requireAdmin, adminDailyInquiries);
router.post("/admin/daily-inquiries", requireAuth, requireAdmin, createDailyInquiryHandler);
router.delete("/admin/daily-inquiries/:id", requireAuth, requireAdmin, deleteDailyInquiryHandler);

module.exports = router;
