/* global exports */
/**
 * Wrapper to call controller functions whilst catching any error
 * and passing it to the errosCollector middleware.
 * @param {Function} fn Function whose errors we want to catch
 * @returns {Function} Wrapper function
 */
exports.catchErrors = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
};

exports.notFound = (req, res, next) => {
  const err = new Error('La page demandée n\'existe pas.');
  err.status = 404;
  next(err);
};

function printError(error, req) {
  console.error('ERROR :');
  console.error(error.message);
  console.error('REQUEST :');
  console.error({
    method: req.method,
    url: req.url,
    body: req.body,
  });
  console.error('STACK :');
  console.error(error.stack);
}

exports.errorsCollector = (error, req, res, next) => {
  printError(error, req);
  error.status = error.status || 500;
  return res.status(error.status).render('error', { error: error });
};

exports.apiErrorsCollector = (error, req, res, next) => {
  printError(error, req);
  error.status = error.status || 500;
  return res.status(error.status).json({
    statusCode: error.status,
    message: error.message
  });
};
