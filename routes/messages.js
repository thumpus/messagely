const Router = require("express").Router;
const router = new Router();
const Message = require("../models/messages");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async function(req, res, next){
    try {
        let message = Message.get(req.params.id);
        if (message.from_user.username !== req.user.username || message.to_user.username !== req.user.username){
            return next({ status: 401, message: "Unauthorized" });
        } else {
            return res.json({message});
        }
    } catch (err){
        return next(err);
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async function (req, res, next){
    try {
        let message = Message.create(req.user.username, req.body.to_username, req.body.body);
        return res.json({message});
    } catch(err){
        return next(err);
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async function (req, res, next){
    try {
        let message = Message.get(req.params.id);
        if(message.to_username !== req.user.username){
            return next({ status: 401, message: "Unauthorized."});
        } else {
            let read = Message.markRead(req.params.id);
            return res.json({message: read})
        }
    } catch (err) {
        return next(err);
    }
})

