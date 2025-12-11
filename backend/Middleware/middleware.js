import jwt from "jsonwebtoken"

export default function (req,res,next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(400).json ({message:"invalid token"});

    const token = authHeader.split (' ')[1]

    try {

        const decoded = jwt.verify (token,process.env.JWT_SECRET);

        req.user = decoded;

        next ();
    } catch (error) {
        return res.status (400).json ({message:"Invalid token"})
    }
}