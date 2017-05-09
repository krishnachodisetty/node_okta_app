/**
 * ResourcesController
 * @author Swamy Kurakula
 *
 */

const appDir = require('path').dirname(require.main.filename);
const fileUtil = require(`${appDir}/utils/fileUtil`);
const uuidV1 = require('uuid/v1');

/**
 * API to create user
 *
 * @method createUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var createUser = function(req, res) {
    console.log('req.body');
    console.log(req.body);
    let self = {}, reqBody = JSON.parse(JSON.stringify(req.body));
    console.log(reqBody);

    ['userName', 'active'].forEach(a => {
        self[a] = reqBody[a];
    });
    ['familyName', 'givenName'].forEach(a => {
        self[a] = reqBody['name'][a];
    });

    self.id = uuidV1();

    var response = {
        'schemas': ['urn:ietf:params:scim:schemas:core:2.0:User'],
        'id': self.id,
        'userName': self.userName,
        'name': {
            'familyName': self.familyName,
            'givenName': self.givenName
        },
        'active': self.active,
        'meta': {
            'resourceType': 'User',
            'location': `https://${req.hostname}:8080/scim/v2/Users/${self.id}`
        }
    };

    fileUtil.writeFile(''/* filename optional (default.json will be considered as file name)*/, response, function(err){
      res.status(201).json(response);
    });
};

/**
 * API to get list of Users
 *
 * @method getUsers.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var getUsers = function(req, res) {
  const rv = {
              "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
              "totalResults": '',
              "startIndex": '',
              "Resources": []
            };

  fileUtil.readFile('default.json', function(data){
    rv["totalResults"] = data.users.length;
    rv["startIndex"] = 0;

    if(req.query.attributes){
      var customizedUsers = [];
      for(var i=0; i < data.users.length; i++){
        const cu = {};
        cu.id = data.users[i].id;
        cu[req.query.attributes] = data.users[i][req.query.attributes];
        customizedUsers.push(cu);
      }
      rv["Resources"] = customizedUsers;
    } else {
       rv["Resources"] = data.users;
    }

    res.status(200).json(rv);

  });
};

/**
 * API to get user details by user_id
 *
 * @method getUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var getUser = function(req, res) {
  fileUtil.readFile('default.json', function(data){

    var u = {};

    for(var i=0; i < data.users.length; i++){
      if(data.users[i].id === req.params.user_id) {
        u = data.users[i];
        break;
      }
    }

    if(Object.keys(u).length)
      res.status(200).json(u);
    else
      res.status(404).json({
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
        "detail": "User not found",
        "status": 404 + ""
      });
  });
};

/**
 * API to update user
 *
 * @method updateUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var updateUser = function(req, res) {
  fileUtil.readFile('default.json', function(data){

    let foundIndex = -1;

    for(var i=0; i < data.users.length; i++){
      if(data.users[i].id === req.params.user_id) {
        Object.keys(data.users[i]).forEach(k => {
          foundIndex = i;
          data.users[i][k] = req.body[k];
        });
        break;
      }
    }

    fileUtil.writeFile(''/* filename optional (default.json will be considered as file name)*/, JSON.stringify(data, null, 2), function(err){
      res.status(200).json(data.users[foundIndex]);
    });
  });
};

/**
 * API to deprovision or deactivate user
 *
 * @method deprovisionUser.
 * @param {object} req -  request object.
 * @param {object} res -  response object.
 */
var deprovisionUser = function(req, res) {

};

/**
 *
 *  Exporting ResourcesController module
 *
 */
module.exports = {
    "createUser": createUser,
    "getUsers": getUsers,
    "getUser": getUser,
    "updateUser": updateUser,
    "deprovisionUser": deprovisionUser
}
