/**
 * src/controllers/settings.controller.js — NEW
 */

import * as settingsService from "../services/settings.service.js";

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await settingsService.getCompanySettings();
    res.status(200).json({ success: true, count: companies.length, data: { companies } });
  } catch (err) { next(err); }
};

export const createCompany = async (req, res, next) => {
  try {
    const company = await settingsService.createCompany(req.body);
    res.status(201).json({ success: true, message: "Company created", data: { company } });
  } catch (err) { next(err); }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await settingsService.updateCompany(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Company updated", data: { company } });
  } catch (err) { next(err); }
};

export const listAllUsers = async (req, res, next) => {
  try {
    const users = await settingsService.listAllUsers();
    res.status(200).json({ success: true, count: users.length, data: { users } });
  } catch (err) { next(err); }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const user = await settingsService.changeUserRole(req.params.id, req.body.role);
    res.status(200).json({ success: true, message: "User role updated", data: { user } });
  } catch (err) { next(err); }
};
