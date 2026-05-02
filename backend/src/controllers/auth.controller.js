/**
 * src/controllers/auth.controller.js
 * HTTP handlers for auth endpoints.
 * Controllers are thin — they only handle request/response.
 * All business logic lives in the service layer.
 */

import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
