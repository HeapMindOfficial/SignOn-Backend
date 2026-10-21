import { Router } from 'express';
import {
  changePassword,
  forgotPassword,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  registerUserInfo,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import {
  userLoginSchema,
  userRegisterInfoSchema,
  userRegisterInitialSchema,
} from '../../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: userRegisterInitialSchema }), registerUser);
authRouter.post(
  '/register/info',
  authenticate,
  validate({ body: userRegisterInfoSchema }),
  registerUserInfo,
);
authRouter.post('/login', validate({ body: userLoginSchema }), loginUser);
authRouter.post('/logout', logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/resend-verification-email', resendVerificationEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/change-password', changePassword);
