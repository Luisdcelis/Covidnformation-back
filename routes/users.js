const express = require("express");
const router = express.Router();
const neo4j_calls = require("../neo4j_calls/neo4j_api");

router.get("/usernames", async function (_req, res) {
  const result = await neo4j_calls.get_usernames();
  res.status(200).send({ result });
});

router.get("/emails", async function (_req, res) {
  const result = await neo4j_calls.get_emails();
  res.status(200).send({ result });
});

router.get("/closecircle/:id", async function (req, res) {
  const result = await neo4j_calls.get_closecircle({ username: req.params.id });
  res.status(200).send({ result });
});

router.get("/notifications/:id", async function (req, res) {
  const result = await neo4j_calls.get_notifications({
    username: req.params.id,
  });
  res.status(200).send({ result });
});

router.get("/petitions/:id", async function (req, res) {
  const result = await neo4j_calls.get_petitions({
    username: req.params.id,
  });
  res.status(200).send({ result });
});

router.delete("/notifications/:receiver/:sender", async function (req, res) {
  const result = await neo4j_calls.delete_notification({
    receiver: req.params.receiver,
    sender: req.params.sender,
  });
  res.status(200).send({ result });
});

router.delete("/petitions/:from/:to", async function (req, res) {
  const result = await neo4j_calls.delete_petition({
    from: req.params.from,
    to: req.params.to,
  });
  res.status(200).send({ result });
});

router.post("/petitions/:from/:to", async function (req, res) {
  const result = await neo4j_calls.create_petition({
    from: req.params.from,
    to: req.params.to,
  });
  res.status(200).send({ result });
});

router.post("/InContact/:from/:to", async function (req, res) {
  const result = await neo4j_calls.create_incontact({
    from: req.params.from,
    to: req.params.to,
    date: req.body.date,
  });
  res.status(200).send({ result });
});

router.get("/user/:id", async function (req, res) {
  const result = await neo4j_calls.get_user({ username: req.params.id });
  res.status(200).send({ result });
});

router.get("/admin/:id", async function (req, res) {
  const result = await neo4j_calls.get_admin({ username: req.params.id });
  res.status(200).send({ result });
});

router.post("/", async function (req, res) {
  const string = await neo4j_calls.create_user({ ...req.body });
  res.status(200).send("User named " + string + " created");
});

router.put("/updateLocation/:id", async function (req, res) {
  const string = await neo4j_calls.set_dataProvCity({
    ide: req.params.id,
    ...req.body,
  });
  res.status(200).send("User named " + string + " created");
});

router.put("/updateCC/:id", async function (req, res) {
  const string = await neo4j_calls.delete_closecircle({
    username: req.params.id,
  });
  const aux = await neo4j_calls.set_closecircle({
    username: req.params.id,
    ...req.body,
  });
  res.status(200).send("User named " + string + " created");
});

router.put("/updateIC/:id", async function (req, res) {
  const string = await neo4j_calls.delete_incontact({
    username: req.params.id,
  });
  const aux = await neo4j_calls.set_incontact({
    username: req.params.id,
    ...req.body,
  });
  res.status(200).send("User named " + string + " created");
});

router.put("/:id", async function (req, res) {
  const string = await neo4j_calls.set_data({
    ide: req.params.id,
    ...req.body,
  });
  res.status(200).send("User named " + string + " created");
});

router.delete("/:id", async function (req, res) {
  const string = await neo4j_calls.delete_user({
    username: req.params.id,
  });
  res.status(204).send("User named " + string + " eliminated");
});

module.exports = router;
