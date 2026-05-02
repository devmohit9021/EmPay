/**
 * src/controllers/analytics.controller.js — NEW
 */

import * as analyticsService from "../services/analytics.service.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getAdminStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const getPayrollStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getPayrollStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) { next(err); }
};
