import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const userController = new UserController();

// Apply authentication to all user routes
router.use(authenticateToken as import("express").RequestHandler);

// Only owners and managers can create/update/delete users
router.post("/", userController.createUser);

router.get("/branch/:branchId", userController.getUsers);

router.get("/:id", userController.getUser);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

// PIN operations
router.post("/:id/setup-pin", userController.setupPIN);
router.post("/:id/verify-pin", userController.verifyPIN);

export { router as userRoutes };
