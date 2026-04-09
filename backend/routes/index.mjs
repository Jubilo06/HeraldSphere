import { Router } from "express";
import userRouter from "./user.mjs";
import postRouter from "./post.mjs";
import authRouter from "./auth.mjs"

const router = Router();
router.use(userRouter);
router.use(postRouter);
router.use(authRouter);



export default router;
