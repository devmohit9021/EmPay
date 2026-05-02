import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Share2, Building, User, Calendar, CreditCard } from 'lucide-react';
import payrollService from '../../services/payrollService';
import toast from 'react-hot-toast';

const PayslipPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payslip, setPayslip] = useState(null);

  useEffect(() => {
    // For now, using mock data that matches the Stitch design
    // In real app, fetch from payrollService.getPayslips(employeeId)
    setTimeout(() => {
      setPayslip({
        month: 'October 2024',
        payDate: '01 Nov 2024',
        employee: {
          name: 'John Doe',
          id: 'EMP-2024-001',
          department: 'Engineering',
          designation: 'Senior Developer',
          pan: 'ABCDE1234F',
          uan: '100012345678',
          bank: 'HDFC Bank (....5678)'
        },
        workedDays: 22,
        earnings: [
          { name: 'Basic Salary', amount: 25000 },
          { name: 'House Rent Allowance', amount: 12500 },
          { name: 'Standard Allowance', amount: 4167 },
          { name: 'Performance Bonus', amount: 2082 },
          { name: 'Fixed Allowance', amount: 6251 }
        ],
        deductions: [
          { name: 'PF Employee', amount: 3000 },
          { name: 'PF Employer', amount: 3000 },
          { name: 'Professional Tax', amount: 200 },
          { name: 'TDS', amount: 0 }
        ],
        totalEarnings: 50000,
        totalDeductions: 6200,
        netPayable: 43800
      });
      setLoading(false);
    }, 500);
  }, [employeeId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Payroll</span>
        </button>

        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print Payslip</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto print:m-0 print:shadow-none">
        {/* Header */}
        <div className="bg-surface p-8 text-white flex justify-between items-start border-b border-white border-opacity-10">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-xl italic">E</div>
              <span className="text-2xl font-black tracking-tighter uppercase">EmPay HRMS</span>
            </div>
            <p className="text-gray-400 text-sm">Smart Resource Management Solutions</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-1">SALARY SLIP</h2>
            <p className="text-primary font-bold">{payslip.month}</p>
          </div>
        </div>

        <div className="p-10 space-y-10">
          {/* Employee & Company Info */}
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Employee Details</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Name:</span> <span className="font-bold">{payslip.employee.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Employee ID:</span> <span className="font-bold">{payslip.employee.id}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Designation:</span> <span className="font-bold">{payslip.employee.designation}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Department:</span> <span className="font-bold">{payslip.employee.department}</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Payment Info</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">PAN Number:</span> <span className="font-bold">{payslip.employee.pan}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">UAN Number:</span> <span className="font-bold">{payslip.employee.uan}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Bank Account:</span> <span className="font-bold">{payslip.employee.bank}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pay Date:</span> <span className="font-bold">{payslip.payDate}</span></div>
              </div>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
            <div className="flex items-center space-x-3">
              <Calendar className="text-primary" size={20} />
              <span className="text-sm font-semibold">Working Days in Month</span>
            </div>
            <span className="text-xl font-black text-primary">{payslip.workedDays} Days</span>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden">
            {/* Earnings Column */}
            <div className="border-r border-gray-200">
              <div className="bg-gray-800 text-white px-6 py-3 text-xs font-black uppercase tracking-widest">Earnings</div>
              <div className="p-6 space-y-4">
                {payslip.earnings.map((e, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{e.name}</span>
                    <span className="font-bold">₹{e.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between font-black text-sm">
                <span>Gross Earnings</span>
                <span className="text-primary">₹{payslip.totalEarnings.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div>
              <div className="bg-red-900 text-white px-6 py-3 text-xs font-black uppercase tracking-widest">Deductions</div>
              <div className="p-6 space-y-4">
                {payslip.deductions.map((d, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-bold text-red-600">-₹{d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between font-black text-sm">
                <span>Total Deductions</span>
                <span className="text-red-600">₹{payslip.totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Payable Footer */}
          <div className="bg-primary p-8 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl shadow-primary/30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Net Payable Amount</p>
            <h3 className="text-5xl font-black">₹{payslip.netPayable.toLocaleString()}</h3>
            <p className="mt-4 text-sm font-medium italic text-white text-opacity-80">
              In words: Forty Three Thousand Eight Hundred Rupees Only
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-12 flex justify-between px-10 no-print">
            <div className="text-center">
              <div className="w-40 border-b border-gray-300 mb-2"></div>
              <p className="text-xs text-gray-500 uppercase font-bold">Employee Signature</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-gray-300 mb-2"></div>
              <p className="text-xs text-gray-500 uppercase font-bold">Director / HR Manager</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          This is a computer generated payslip and does not require a physical signature.
        </div>
      </div>
    </div>
  );
};

export default PayslipPage;
