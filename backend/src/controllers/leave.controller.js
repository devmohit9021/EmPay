/**
 * src/controllers/leave.controller.js — v2
 */

import * as leaveService from "../services/leave.service.js";

export const applyLeave = async (req, res, next) => {
  try {
    const documentUrl = req.file ? req.file.path : undefined;
    const leave = await leaveService.applyLeave(req.user.id, req.user.role, { ...req.body, documentUrl });
    res.status(201).json({ success: true, message: "Leave application submitted", data: { leave } });
  } catch (err) { next(err); }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getMyLeaves(req.user.id);
    res.status(200).json({ success: true, count: leaves.length, data: { leaves } });
  } catch (err) { next(err); }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    res.status(200).json({ success: true, count: leaves.length, data: { leaves } });
  } catch (err) { next(err); }
};

export const approveLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.approveLeave(req.params.id);
    res.status(200).json({ success: true, message: "Leave approved", data: { leave } });
  } catch (err) { next(err); }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.rejectLeave(req.params.id);
    res.status(200).json({ success: true, message: "Leave rejected", data: { leave } });
  } catch (err) { next(err); }
};

export const allocateLeave = async (req, res, next) => {
  try {
    const balance = await leaveService.allocateLeaves(req.body.employeeId, req.body.year, req.body.daysToGrant);
    res.status(200).json({ success: true, message: "Leave days allocated successfully", data: { balance } });
  } catch (err) { next(err); }
};

export const getLeaveBalance = async (req, res, next) => {
  try {
    const balance = await leaveService.getLeaveBalance(req.params.employeeId);
    res.status(200).json({ success: true, data: { balance } });
  } catch (err) { next(err); }
};
