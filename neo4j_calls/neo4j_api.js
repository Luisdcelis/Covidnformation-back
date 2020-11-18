let neo4j = require("neo4j-driver");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
var validator = require("validator");

const creds = {
  neo4jusername: "neo4j",
  neo4jpw: "neo4j",
};
let driver = neo4j.driver(
  "bolt://0.0.0.0:7687",
  neo4j.auth.basic(creds.neo4jusername, creds.neo4jpw)
);

exports.get_num_nodes = async function () {
  let session = driver.session();
  const num_nodes = await session.run("MATCH (n) RETURN n", {});
  session.close();
  console.log("RESULT", !num_nodes ? 0 : num_nodes.records.length);
  return !num_nodes ? 0 : num_nodes.records.length;
};

exports.create_user = async function (data) {
  let session = driver.session();
  let user = "No User Was Created";
  const PassCrypt = await bcrypt.hash(data.password, saltRounds);

  if (
    validator.isEmail(data.email) &&
    validator.isAlphanumeric(data.username) &&
    validator.isLength(data.username, { min: 4, max: 16 })
  ) {
    try {
      user = await session.run(
        "MERGE (n:user {username: $username, name: $name, email: $email, password: $password, prov: $prov, city: $city}) RETURN n",
        {
          username: data.username,
          name: data.name,
          password: PassCrypt,
          email: data.email,
          prov: data.prov ? data.prov : "",
          city: data.city ? data.city : "",
        }
      );
    } catch (err) {
      console.error(err);
      return user;
    }
    return user.records[0].get(0).properties.name;
  } else {
    return new Error("Error al añadir user");
  }
};

exports.set_dataProvCity = async function (data) {
  let session = driver.session();
  let user = "No User Was Created";

  try {
    user = await session.run(
      "MATCH (n: user) WHERE n.username=$username SET n.prov=$prov, n.city=$city RETURN n",
      {
        username: data.username,
        prov: data.prov,
        city: data.city,
        name: data.name,
        email: data.email,
      }
    );
  } catch (err) {
    console.error(err);
    return user;
  }
  return user.records[0].get(0).properties.name;
};

exports.set_data = async function (data) {
  let session = driver.session();
  let user = "No User Was Created";

  try {
    user = await session.run(
      "MATCH (n: user) WHERE n.username=$username SET n.email=$email, n.name=$name, n.prov=$prov, n.city=$city RETURN n",
      {
        username: data.username,
        prov: data.prov,
        city: data.city,
        name: data.name,
        email: data.email,
      }
    );
  } catch (err) {
    console.error(err);
    return user;
  }
  return user.records[0].get(0).properties.name;
};

exports.get_usernames = async function () {
  let session = driver.session();
  let users = await session.run("MATCH (n:user) RETURN n", {});
  session.close();
  return users.records.map((o) => o.get(0).properties.username);
};

exports.get_user = async function (data) {
  let session = driver.session();
  let user = await session.run(
    "MATCH (n:user) WHERE n.username=$username RETURN properties(n)",
    {
      username: data.username,
    }
  );
  session.close();
  return user.records[0]._fields[0];
};
exports.delete_user = async function (data) {
  let session = driver.session();
  let user = await session.run(
    "MATCH (n:user {username: $username})-[r]-() DELETE r",
    {
      username: data.username,
    }
  );
  user = await session.run("MATCH (n:user {username: $username}) DELETE n", {
    username: data.username,
  });
  session.close();
  return "eliminado " + data.username;
};

exports.get_closecircle = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$username})-[:CloseCircle]->(b) RETURN b",
    {
      username: data.username,
    }
  );
  session.close();
  return users.records.map((o) => o.get(0).properties.username);
};

exports.get_notifications = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$username})<-[r:InContact]-(b) RETURN properties(r), b.username,  b.name",
    {
      username: data.username,
    }
  );
  session.close();
  let aux = [];
  if (users.records !== []) {
    aux = users.records.map((i) => {
      return { ...i._fields[0], username: i._fields[1], name: i._fields[2] };
    });
  }
  return aux;
};

exports.get_petitions = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$username})<-[r:Petition]-(b) RETURN  b.username,  b.name",
    {
      username: data.username,
    }
  );
  session.close();
  let aux = [];
  if (users.records !== []) {
    aux = users.records.map((i) => {
      return { username: i._fields[0], name: i._fields[1] };
    });
  }
  return aux;
};

exports.delete_closecircle = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$username})-[r:CloseCircle]->() DELETE r",
    {
      username: data.username,
    }
  );
  session.close();
  return "eliminadas relaciones de " + data.username;
};

exports.set_closecircle = async function (data) {
  let users;
  data.closeCircle.map(async (i, k) => {
    let session = driver.session();
    users = await session.run(
      "MATCH (a:user {username: $usernameA}), (b:user {username: $usernameB}) CREATE (a)-[r:CloseCircle]->(b) RETURN type(r)",
      {
        usernameA: data.username,
        usernameB: i,
      }
    );
    session.close();
  });

  return "creadas relaciones de " + data.username;
};

exports.delete_incontact = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$username})-[r:InContact]->() DELETE r",
    {
      username: data.username,
    }
  );
  session.close();
  return "eliminadas relaciones de " + data.username;
};

exports.delete_notification = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$sender})-[r:InContact]->(:user {username: $receiver}) DELETE r",
    {
      receiver: data.receiver,
      sender: data.sender,
    }
  );
  session.close();
  return "eliminadas notificacion de " + data.sender + " a " + data.receiver;
};

exports.delete_petition = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (:user {username:$from})-[r:Petition]->(:user {username: $to}) DELETE r",
    {
      from: data.from,
      to: data.to,
    }
  );
  session.close();
  return "eliminadas peticion de " + data.from + " a " + data.to;
};

exports.create_petition = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (a:user {username:$from}), (b:user {username: $to}) CREATE (a)-[r:Petition]->(b) RETURN type(r)",
    {
      to: data.to,
      from: data.from,
    }
  );
  session.close();
  return "creada peticion " + data.from + " a " + data.to;
};

exports.create_incontact = async function (data) {
  let session = driver.session();
  let users = await session.run(
    "MATCH (a:user {username:$from}), (b:user {username: $to}) CREATE (a)-[r:InContact {date: $date, anon: $anon}]->(b) RETURN type(r)",
    {
      to: data.to,
      from: data.from,
      date: data.date,
      anon: false,
    }
  );
  session.close();
  return "creada incontact " + data.from + " a " + data.to;
};

exports.set_incontact = async function (data) {
  let users;
  data.incontact.map(async (i, k) => {
    let session = driver.session();
    users = await session.run(
      "MATCH (a:user {username: $usernameA}), (b:user {username: $usernameB}) CREATE (a)-[r:InContact {date: $date, anon: $anon}]->(b) RETURN type(r)",
      {
        usernameA: data.username,
        usernameB: i.username,
        date: data.date,
        anon: i.anon,
      }
    );
    session.close();
  });

  return "creadas relaciones de " + data.username;
};

exports.get_admin = async function (data) {
  let session = driver.session();
  let user = await session.run(
    "MATCH (n:admin) WHERE n.username=$username RETURN properties(n)",
    {
      username: data.username,
    }
  );
  session.close();
  return user.records[0]._fields[0];
};

exports.get_emails = async function () {
  let session = driver.session();
  let users = await session.run("MATCH (n:user) RETURN n", {});
  session.close();
  return users.records.map((o) => o.get(0).properties.email);
};
