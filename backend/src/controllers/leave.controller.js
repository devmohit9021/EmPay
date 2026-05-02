/**
 * src/controllers/leave.controller.js
 * HTTP handlers for leave management endpoints.
 */

import * as leaveService from "../services/leave.service.js";

export const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: { leave },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getMyLeaves(req.user.id);
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: { leaves },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: { leaves },
    });
  } catch (err) {
    next(err);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await leaveService.approveLeave(id);
    res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: { leave },
    });
  } catch (err) {
    next(err);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await leaveService.rejectLeave(id);
    res.status(200).json({
      success: true,
      message: "Leave rejected",
      data: { leave },
    });
  } catch (err) {
    next(err);
  }
};
