const express = require("express");
const {
  addCompany,
  addUserToCompany,
  getCompanyDetails,
  editUser,
  deleteUser,
  editCompany,
  deleteCompany,
  getUsers,
  getUser,
} = require("../controllers/companyController");

const router = express.Router();

// Company routes
router.post("/company", addCompany);
router.put("/company/:companyId", editCompany);
router.delete("/company/:companyId", deleteCompany);
router.get("/company/:companyId", getCompanyDetails);

// User routes
router.post("/company/:companyId/users", addUserToCompany);
router.get("/company/:companyId/users", getUsers);
router.get("/company/:companyId/users/:userId", getUser); 
router.put("/users/:userId", editUser);
router.delete("/users/:userId", deleteUser);

module.exports = router;
