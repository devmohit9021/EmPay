/**
 * src/controllers/employee.controller.js
 * HTTP handlers for employee management endpoints.
 */

import * as employeeService from "../services/employee.service.js";

export const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({
      success: true,
      message: "Employee profile created successfully",
      data: { employee },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.status(200).json({
      success: true,
      count: employees.length,
      data: { employees },
    });
  } catch (err) {
    next(err);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.updateEmployee(id, req.body);
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: { employee },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyEmployeeProfile = async (req, res, next) => {
  try {
    // Find the employee profile linked to the authenticated user
    const employee = await employeeService.getEmployeeByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile found for your account. Contact HR.',
      });
    }
    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);
    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (err) {
    next(err);
  }
};
