/* global exports */
const sanitizeHtml = require('sanitize-html');

exports.sanitizeRequestBody = (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    req.body[key] = sanitizeHtml(req.body[key], {
      allowedTags: [],
      allowedAttributes: {},
    });
  });
  next();
};
