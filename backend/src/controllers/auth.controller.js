/**
 * src/controllers/auth.controller.js — v3
 * Added: setupCompany, checkSetup handlers
 */

import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    // role is validated by registerSchema (EMPLOYEE|HR|PAYROLL) — defaults to EMPLOYEE
    const { name, email, password, role } = req.body;
    const { user, token } = await authService.registerUser({ name, email, password, role });
    res.status(201).json({ success: true, message: "Account created successfully.", data: { user, token } });
  } catch (err) { next(err); }
};

export const setupCompany = async (req, res, next) => {
  try {
    const result = await authService.setupCompany(req.body);
    res.status(201).json({
      success: true,
      message: `Company "${result.company.name}" created. Admin account is ready.`,
      data: result,
    });
  } catch (err) { next(err); }
};

export const checkSetup = async (req, res, next) => {
  try {
    const isSetup = await authService.isSystemSetup();
    res.status(200).json({ success: true, data: { isSetup } });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.status(200).json({ success: true, message: "Login successful", data: { user, token } });
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: "Profile updated", data: { user } });
  } catch (err) { next(err); }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await authService.updateUserRole(id, role);
    res.status(200).json({ success: true, message: "User role updated", data: { user } });
  } catch (err) { next(err); }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({ success: true, count: users.length, data: { users } });
  } catch (err) { next(err); }
};
