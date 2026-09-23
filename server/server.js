require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");


// ======================================================
// ROUTE LOADER
// Gives a clear error if a route file is exported wrong
// ======================================================

const loadRouter = (name, path) => {
  const router = require(path);

  if (typeof router !== "function") {
    throw new TypeError(
      `${name} is not a valid Express router. ` +
      `Check ${path} and make sure it ends with: module.exports = router;`
    );
  }

  return router;
};


// ======================================================
// ROUTES
// ======================================================

const authRoutes = loadRouter(
  "authRoutes",
  "./routes/authRoutes"
);

const userRoutes = loadRouter(
  "userRoutes",
  "./routes/userRoutes"
);

const courseRoutes = loadRouter(
  "courseRoutes",
  "./routes/courseRoutes"
);

const offeringRoutes = loadRouter(
  "offeringRoutes",
  "./routes/offeringRoutes"
);

const registrationRoutes = loadRouter(
  "registrationRoutes",
  "./routes/registrationRoutes"
);

const studentRoutes = loadRouter(
  "studentRoutes",
  "./routes/studentRoutes"
);


// ======================================================
// APP
// ======================================================

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:3000",

    credentials: true,
  })
);

app.use(express.json());


// ======================================================
// ROOT TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    message:
      "Course Registration API is running.",
  });
});


// ======================================================
// API ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/courses",
  courseRoutes
);

app.use(
  "/api/offerings",
  offeringRoutes
);

app.use(
  "/api/registrations",
  registrationRoutes
);

/*
  studentRoutes contains:

  /students/:id/record
  /students/:id/eligible

  /me/registrations
  /me/record
*/
app.use(
  "/api",
  studentRoutes
);


// ======================================================
// 404
// ======================================================

app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found.",
  });
});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {
  console.error(
    "Unhandled server error:",
    error
  );

  return res.status(500).json({
    message:
      "An unexpected server error occurred.",
  });
});


// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing from .env"
      );
    }

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );

      console.log(
        `Frontend allowed from ${
          process.env.CLIENT_URL ||
          "http://localhost:3000"
        }`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
};

startServer();