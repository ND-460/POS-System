const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotanv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const { bgCyan } = require("colors");
require("./config/passport");
require("colors");
const connectDb = require("./config/config");
const userRoutes = require("./routes/userRoutes");
//dotenv config
dotanv.config();
//db config
connectDb();
//rest object
const app = express();

//middlwares
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
};

app.use('/media',express.static('client/public'))

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.use(cors(corsOptions));
const categoryRoutes = require("./routes/categoryRoutes");
const reportsRoute = require("./routes/reportsRoute");

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`); // Debugging log
  console.log("Request Body:", req.body); // Debugging log
  next();
});

app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportsRoute);


//routes
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/bills", require("./routes/billsRoute"));
app.use("/api", userRoutes);

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`.bgCyan.white);
});

// JWT Middleware
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// Example: Protecting a route
app.use("/api/protected-route", verifyToken, (req, res) => {
  res.status(200).json({ message: "Access granted to protected route." });
});
