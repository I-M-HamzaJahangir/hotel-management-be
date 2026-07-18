import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import authRoutes from "./modules/auth/auth.route";
import userRoutes from "./modules/user/user.route";
import amenityAdminRoutes from "./modules/amenity/amenity.admin.routes";
import amenityRoutes from "./modules/amenity/amenity.routes";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/authenticate";
import { authorize } from "./middleware/authorize";
import { USER_ROLES } from "./constants/role";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use(
  "/api/v1/admin/amenities",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  amenityAdminRoutes,
);
app.use("/api/v1/amenities", amenityRoutes);

app.use(errorHandler);
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

start();
