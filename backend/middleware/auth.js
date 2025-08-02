const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")
    const user = await User.findById(decoded.id).select("-password")
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }
    next()
  }
}




 const genAuthToken = (userId,res)=>{
    const token = jwt.sign({
        id:userId,
    },process.env.JWT_SECRET,{
        expiresIn:"30d"
    })
    res.cookie("jwt",token,{
        httpOnly:true,
        sameSite:"lax",
        secure:process.env.NODE_ENV!="development",
        maxAge:24*60*60*1000
    })
}

module.exports = {auth,authorize,genAuthToken}
