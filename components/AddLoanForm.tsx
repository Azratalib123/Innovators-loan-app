
import React, { useState, useEffect } from 'react';
import { useLoanManager } from '../hooks/useLoanManager';
import { NewLoanData, LoanFee, LoanStatus, Repayment } from '../types';
import { generateInstallmentSchedule, calculateMaxLoanEligibility, calculateMLRiskScore, scoreToRiskLevel } from '../utils/loanCalculations';
import { Plus, X, RefreshCw, Calendar, ChevronDown, Info, Trash2 } from 'lucide-react';

const RiskGauge: React.FC<{ score: number }> = ({ score }) => {
    const angle = score * 180;
    return (
        <div className="relative w-full max-w-[200px] h-[100px] mx-auto mt-4 mb-2">
            <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                        <stop offset="50%" stopColor="#f59e0b" /> {/* Orange/Yellow */}
                        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                    </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#374151" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - score)} />
                
                {/* Needle */}
                <circle cx="100" cy="100" r="6" fill="white" />
                <line x1="100" y1="100" x2="0" y2="100" stroke="white" strokeWidth="4" strokeLinecap="round" transform={`rotate(${angle} 100 100)`} />
            </svg>
        </div>
    );
};

export const AddLoanForm: React.FC = () => {
    const { clients, addLoan, globalSettings, setCurrentView } = useLoanManager();
    
    // Form Fields
    const [status, setStatus] = useState<LoanStatus>(LoanStatus.Processing);
    const [clientId, setClientId] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState<number>(1);
    const [durationPeriod, setDurationPeriod] = useState('Months');
    const [interestMethod, setInterestMethod] = useState('Flat Interest');
    const [interestRate, setInterestRate] = useState<number>(0);
    const [interestCycle, setInterestCycle] = useState('Once');
    const [repaymentCycle, setRepaymentCycle] = useState('Once');
    const [account, setAccount] = useState('Cash');
    
    // Fees
    const [fees, setFees] = useState<LoanFee[]>([]);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [newFee, setNewFee] = useState<Partial<LoanFee>>({ name: '', type: 'Fixed Amount', value: 0, isDeductible: false });

    // Calculations & Risk
    const [calculatedRisk, setCalculatedRisk] = useState(0);
    const [schedule, setSchedule] = useState<Repayment[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    useEffect(() => {
        const loanData = {
            loanAmount: amount,
            durationMonths: duration, // Simplified for mock calculation
            interestRate: interestRate,
            startDate: new Date(releaseDate),
            repaymentCycle: repaymentCycle as any,
            interestMethod: interestMethod as any
        };
        // @ts-ignore - partial mock
        const newSchedule = generateInstallmentSchedule(loanData);
        setSchedule(newSchedule);
    }, [amount, duration, interestRate, releaseDate, repaymentCycle, interestMethod]);

    const handleGetRiskScore = () => {
        if(!clientId) return;
        setIsCalculating(true);
        setTimeout(() => {
             const client = clients.find(c => c.id === clientId);
             if(client) {
                 const risk = calculateMLRiskScore(client);
                 setCalculatedRisk(risk);
             }
             setIsCalculating(false);
        }, 1000);
    };

    const handleAddFee = () => {
        if (newFee.name && newFee.value !== undefined) {
            setFees([...fees, { ...newFee, id: Date.now().toString() } as LoanFee]);
            setIsFeeModalOpen(false);
            setNewFee({ name: '', type: 'Fixed Amount', value: 0, isDeductible: false });
        }
    };

    const removeFee = (id: string) => {
        setFees(fees.filter(f => f.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!clientId) return;
        
        const loanData: NewLoanData = {
            clientId,
            loanAmount: amount,
            durationMonths: duration,
            interestRate: interestRate,
            startDate: new Date(releaseDate),
            loanType: 'Personal', // Default for this form
            interestMethod: interestMethod as any,
            interestCycle: interestCycle as any,
            repaymentCycle: repaymentCycle as any,
            fees: fees
        };
        addLoan(loanData);
        // Add loan handles view switching, but we can force it if needed or rely on context
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto pb-10">
            {/* Left Column: Form */}
            <div className="flex-1 space-y-6">
                <div className="bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-6">Add a loan</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Loan Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Loan Status</label>
                            <div className="relative">
                                <select 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as LoanStatus)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                >
                                    {Object.values(LoanStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* Borrower */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Borrower</label>
                            <div className="relative">
                                <select 
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                >
                                    <option value="">Select Borrower</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* Principal & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Principal Amount</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm">K</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2.5" 
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-xs bg-gray-600 px-1 rounded">ZMW</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Loan Release Date</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={releaseDate}
                                        onChange={(e) => setReleaseDate(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                    <Calendar className="absolute right-3 top-2.5 text-gray-400 h-4 w-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Loan Duration</label>
                                <input 
                                    type="number" 
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Duration Period</label>
                                <div className="relative">
                                    <select 
                                        value={durationPeriod}
                                        onChange={(e) => setDurationPeriod(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                    >
                                        <option>Months</option>
                                        <option>Years</option>
                                        <option>Weeks</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Interest */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Interest Method</label>
                                <div className="relative">
                                    <select 
                                        value={interestMethod}
                                        onChange={(e) => setInterestMethod(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                    >
                                        <option>Flat Interest</option>
                                        <option>Reducing Balance</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Interest Rate</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">%</span>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Interest Cycle</label>
                                <div className="relative">
                                    <select 
                                        value={interestCycle}
                                        onChange={(e) => setInterestCycle(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                    >
                                        <option>Once</option>
                                        <option>Monthly</option>
                                        <option>Yearly</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Repayment Cycle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Repayment Cycle</label>
                            <div className="relative">
                                <select 
                                    value={repaymentCycle}
                                    onChange={(e) => setRepaymentCycle(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                >
                                    <option>Once</option>
                                    <option>Monthly</option>
                                    <option>Weekly</option>
                                    <option>Daily</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                            </div>
                        </div>
                        
                        {/* Account */}
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-1">Account</label>
                            <div className="relative">
                                <select 
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                                >
                                    <option>Cash</option>
                                    <option>Bank Transfer</option>
                                    <option>Mobile Money</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-gray-400 h-4 w-4 pointer-events-none" />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Select the source of the Principal Amount to be disbursed.</p>
                        </div>

                        <div className="pt-2 flex justify-center">
                             <button 
                                type="button"
                                onClick={() => setShowSchedule(!showSchedule)}
                                className="bg-white text-gray-800 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-gray-100 transition-colors"
                             >
                                {showSchedule ? 'Hide Repayment Schedule' : 'View Repayment Schedule'}
                             </button>
                        </div>

                         {showSchedule && (
                            <div className="mt-4 bg-gray-900 rounded p-4 text-sm">
                                <div className="flex justify-between border-b border-gray-700 pb-2 mb-2 text-gray-400">
                                    <span>Date</span>
                                    <span>Amount</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {schedule.map((item, idx) => (
                                        <div key={idx} className="flex justify-between py-1 text-gray-300">
                                            <span>{item.dueDate.toLocaleDateString()}</span>
                                            <span>${item.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold text-white">
                                    <span>Total</span>
                                    <span>${schedule.reduce((a,b)=>a+b.amount,0).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Fees Section */}
                        <div className="border-t border-gray-700 pt-6 mt-6">
                             <h3 className="text-lg font-bold text-white mb-1">Fees</h3>
                             <p className="text-sm text-gray-500 mb-4">Configure loan fees</p>
                             
                             {fees.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {fees.map(fee => (
                                        <div key={fee.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600">
                                            <span className="text-sm text-white">{fee.name}</span>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-400">{fee.value} {fee.type === 'Percentage Based' ? '%' : 'Fixed'}</span>
                                                <button type="button" onClick={() => removeFee(fee.id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             )}

                             <div className="flex justify-center">
                                <button 
                                    type="button"
                                    onClick={() => setIsFeeModalOpen(true)}
                                    className="bg-white text-gray-800 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Add Fees
                                </button>
                             </div>
                        </div>

                        <div className="border-t border-gray-700 pt-6 mt-6 flex justify-end space-x-3">
                             <button 
                                type="button" 
                                onClick={() => setCurrentView('dashboard')}
                                className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
                             >
                                Cancel
                             </button>
                             <button 
                                type="submit" 
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                             >
                                Submit
                             </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Risk Info */}
            <div className="w-full lg:w-96">
                <div className="bg-gray-800 dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-2">Credit Risk Score</h3>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                        Artificial intelligence is used to calculate the credit risk score based on multiple data points and the borrower's historical records across lendbox
                    </p>
                    
                    <RiskGauge score={calculatedRisk} />
                    
                    <div className="text-center mt-4 mb-6">
                        {isCalculating ? (
                            <p className="text-sm text-blue-400 animate-pulse">Analyzing Profile...</p>
                        ) : calculatedRisk > 0 ? (
                            <>
                                <p className="text-3xl font-bold text-white mb-1">{(calculatedRisk * 100).toFixed(0)}</p>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Score</p>
                            </>
                        ) : (
                             <p className="text-sm text-gray-500">Score not calculated</p>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={handleGetRiskScore}
                        disabled={isCalculating || !clientId}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCalculating ? 'Calculating...' : 'Get Risk Score'}
                    </button>
                </div>
            </div>

             {/* Fee Modal */}
             {isFeeModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm p-6 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-lg font-bold text-white">Add Fee</h3>
                             <button onClick={() => setIsFeeModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Fee Name</label>
                                <input 
                                    type="text" 
                                    value={newFee.name}
                                    onChange={e => setNewFee({...newFee, name: e.target.value})}
                                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Processing Fee"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Fee Type</label>
                                <select 
                                    value={newFee.type}
                                    onChange={e => setNewFee({...newFee, type: e.target.value as any})}
                                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                >
                                    <option>Fixed Amount</option>
                                    <option>Percentage Based</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Value</label>
                                <input 
                                    type="number" 
                                    value={newFee.value}
                                    onChange={e => setNewFee({...newFee, value: parseFloat(e.target.value)})}
                                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button onClick={() => setIsFeeModalOpen(false)} className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700">Cancel</button>
                            <button onClick={handleAddFee} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Fee</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
