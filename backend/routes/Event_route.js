const express = require("express");
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, joinEvent, postReview } = require("../controller/Event_controller.js");

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);
router.get("/:id", getEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.post("/:id/participate", joinEvent);
router.post("/:id/reviews", postReview);

module.exports = router;
