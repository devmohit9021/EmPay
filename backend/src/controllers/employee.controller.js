/**
 * src/controllers/employee.controller.js — v2
 */

import * as employeeService from "../services/employee.service.js";

export const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, message: "Employee profile created", data: { employee } });
  } catch (err) { next(err); }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees(req.user.role);
    res.status(200).json({ success: true, count: employees.length, data: { employees } });
  } catch (err) { next(err); }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({ success: true, data: { employee } });
  } catch (err) { next(err); }
};

// GET /employees/me — logged-in user's own employee profile (Issues #15, #16)
export const getMyProfile = async (req, res, next) => {
  try {
    const emp = await employeeService.getEmployeeByUserId(req.user.id);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "No employee profile found for your account. Contact HR.",
      });
    }
    const employee = await employeeService.getEmployeeById(emp.id);
    res.status(200).json({ success: true, data: { employee } });
  } catch (err) { next(err); }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user.role);
    res.status(200).json({ success: true, message: "Employee updated", data: { employee } });
  } catch (err) { next(err); }
};
