function checkUserSession(req, res, next) {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    next();
  }
  
  function checkDealerSession(req, res, next) {
    if (!req.session.dealerId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    next();
  }
  
  module.exports = { checkUserSession, checkDealerSession };
  