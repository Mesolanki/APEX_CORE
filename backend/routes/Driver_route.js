const express = require("express");
const { getDrivers, createDriver, updateDriver, deleteDriver } = require("../controller/Driver_controller.js");

const router = express.Router();

router.get("/", getDrivers);
router.post("/", createDriver);
router.put("/:id", updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
