const { addMessage, getMessages } = require("../controllers/messageController");
const router = require("express").Router();
router.get("/getmsg/", getMessages);
router.post("/addmsg/", addMessage);


module.exports = router;
