import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { CONDITION_DETAILS } from '../constants';
import { Condition, UserProfile } from '../types';
import { User, HeartPulse, Scale, GlassWater, AlertCircle } from 'lucide-react';

const conditionColors: { [key in Condition]: { bg: string; text: string; border: string } } = {
    prediabetes: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-300' },
    diabetes: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-300' },
    fatty_liver: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-300' },
    high_cholesterol: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-300' },
    high_blood_pressure: { bg: 'bg-red-50', text: 'text-red-600', border: 'hover:border-red-300' },
    vitamin_d_deficiency: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'hover:border-yellow-300' },
    vitamin_b12_deficiency: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-300' },
    pcos_hormonal_imbalance: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'hover:border-pink-300' },
    weight_loss_goal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'hover:border-teal-300' },
};

const initialFormData: UserProfile = {
    name: '',
    age: null,
    gender: null,
    conditions: [],
    metrics: {},
    dietaryPreference: 'vegetarian',
    allergies: [],
    weightLossGoal: false,
    currentWeight: null,
    targetWeight: null,
    height: null,
    bmi: null,
    waterIntake: null,
    activityLevel: null,
    sleepHours: null,
};

const HealthProfileSetup: React.FC = () => {
    const { setProfile } = useApp();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<UserProfile>(initialFormData);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 4;

    const handleNext = () => {
        if (!validateStep(step)) return;
        setError(null);
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSaveProfile();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };
    
    const validateStep = (currentStep: number): boolean => {
        switch(currentStep) {
            case 1:
                if (!formData.name.trim() || !formData.age || !formData.gender) {
                    setError("Please fill in all personal details.");
                    return false;
                }
                break;
            case 2:
                 if (formData.conditions.length === 0) {
                    setError("Please select at least one health condition or goal.");
                    return false;
                }
                break;
            case 3:
                 if (!formData.height || !formData.currentWeight) {
                    setError("Please provide your height and current weight.");
                    return false;
                }
                if (formData.conditions.includes('weight_loss_goal') && !formData.targetWeight) {
                    setError("Please enter your target weight.");
                    return false;
                }
                break;
            case 4:
                if (!formData.waterIntake || !formData.activityLevel || !formData.sleepHours) {
                    setError("Please provide all your lifestyle details.");
                    return false;
                }
                break;
        }
        return true;
    }

    const handleChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => {
            const currentValues = (prev[field] as any[]) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(item => item !== value)
                : [...currentValues, value];
            
            const updatedState = { ...prev, [field]: newValues };

            // Also update weightLossGoal boolean
            if (field === 'conditions') {
                updatedState.weightLossGoal = newValues.includes('weight_loss_goal');
            }
            return updatedState;
        });
    };

    const handleSaveProfile = () => {
        if (!validateStep(4)) return;
        
        const bmi = (formData.currentWeight && formData.height) 
            ? parseFloat((formData.currentWeight / ((formData.height / 100) ** 2)).toFixed(1)) 
            : null;

        setProfile({ ...formData, bmi });
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1 formData={formData} handleChange={handleChange} />;
            case 2: return <Step2 formData={formData} handleChange={handleChange} handleMultiSelectChange={handleMultiSelectChange} />;
            case 3: return <Step3 formData={formData} handleChange={handleChange} />;
            case 4: return <Step4 formData={formData} handleChange={handleChange} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <Card className="w-full max-w-3xl">
                <div className="p-4 md:p-8">
                    <h1 className="text-3xl font-heading font-bold text-center mb-2 text-primary">Build Your Health Profile</h1>
                    <p className="text-center text-text-secondary mb-8">Let's get to know you better for personalized advice.</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-danger rounded-lg flex items-center gap-2"><AlertCircle size={20}/> {error}</div>}

                    <div className="animate-fade-in">
                        {renderStep()}
                    </div>
                    
                    <div className="flex justify-between items-center mt-8">
                        <Button variant="secondary" onClick={handleBack} disabled={step === 1} className="border-0 text-text-secondary">Back</Button>
                        <Button onClick={handleNext}>
                            {step === totalSteps ? 'Finish & Start' : 'Next'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Step Components --- //

const Step1 = ({ formData, handleChange }: { formData: UserProfile, handleChange: (f: keyof UserProfile, v: any) => void }) => (
    <div>
        <h2 className="text-xl font-bold font-heading mb-4 text-text-primary">1. Personal Details</h2>
        <div className="space-y-4">
            <InputField label="Name" placeholder="e.g., Rohan Kumar" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
            <InputField label="Age" type="number" placeholder="e.g., 35" value={formData.age || ''} onChange={e => handleChange('age', parseInt(e.target.value) || null)} />
            <div>
                 <label className="font-semibold block mb-2 text-text-primary">Gender</label>
                 <div className="grid grid-cols-3 gap-2">
                     {(['male', 'female', 'other'] as const).map(gender => (
                         <button key={gender} onClick={() => handleChange('gender', gender)} className={`p-3 border-2 rounded-lg capitalize font-semibold transition-colors ${formData.gender === gender ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary hover:border-gray-400'}`}>
                             {gender}
                         </button>
                     ))}
                 </div>
            </div>
        </div>
    </div>
);

const Step2 = ({ formData, handleChange, handleMultiSelectChange }: { formData: UserProfile, handleChange: any, handleMultiSelectChange: any }) => (
    <div>
        <h2 className="text-xl font-bold font-heading mb-4 text-text-primary">2. Health & Diet</h2>
         <div className="space-y-6">
             <div>
                <label className="font-semibold block mb-2 text-text-primary">Health Conditions & Goals</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(Object.keys(CONDITION_DETAILS) as Array<keyof typeof CONDITION_DETAILS>).map((key) => {
                        const { label, icon: Icon } = CONDITION_DETAILS[key];
                        const isSelected = formData.conditions.includes(key);
                        const colors = conditionColors[key];
                        return (
                             <div key={key} onClick={() => handleMultiSelectChange('conditions', key)} className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all h-28 ${isSelected ? 'border-primary bg-green-100 ring-2 ring-primary' : `${colors.bg} border-transparent ${colors.border}`}`}>
                                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-primary' : colors.text}`} />
                                <span className={`font-semibold text-xs ${isSelected ? 'text-primary' : 'text-text-primary'}`}>{label}</span>
                            </div>
                        );
                    })}
                </div>
             </div>
             <InputField label="Allergies (comma-separated)" placeholder="e.g., Nuts, Gluten" value={formData.allergies.join(', ')} onChange={e => handleChange('allergies', e.target.value.split(',').map((s: string) => s.trim()))} />
              <div>
                 <label className="font-semibold block mb-2 text-text-primary">Dietary Preference</label>
                 <select value={formData.dietaryPreference} onChange={(e) => handleChange('dietaryPreference', e.target.value)} className="w-full p-3 border rounded-lg bg-white text-text-primary">
                     <option value="vegetarian">Vegetarian</option>
                     <option value="non-vegetarian">Non-Vegetarian</option>
                     <option value="vegan">Vegan</option>
                     <option value="eggetarian">Eggetarian</option>
                 </select>
            </div>
         </div>
    </div>
);


const Step3 = ({ formData, handleChange }: { formData: UserProfile, handleChange: any }) => (
    <div>
        <h2 className="text-xl font-bold font-heading mb-4 text-text-primary">3. Physical Stats</h2>
        <div className="space-y-4">
             <InputField label="Height (cm)" type="number" placeholder="e.g., 175" value={formData.height || ''} onChange={e => handleChange('height', parseInt(e.target.value) || null)} />
             <InputField label="Current Weight (kg)" type="number" placeholder="e.g., 80" value={formData.currentWeight || ''} onChange={e => handleChange('currentWeight', parseInt(e.target.value) || null)} />
            {formData.conditions.includes('weight_loss_goal') && (
                <div className="animate-fade-in">
                    <InputField label="Target Weight (kg)" type="number" placeholder="e.g., 70" value={formData.targetWeight || ''} onChange={e => handleChange('targetWeight', parseInt(e.target.value) || null)} />
                </div>
            )}
        </div>
    </div>
);

const Step4 = ({ formData, handleChange }: { formData: UserProfile, handleChange: any }) => (
    <div>
        <h2 className="text-xl font-bold font-heading mb-4 text-text-primary">4. Lifestyle Habits</h2>
        <div className="space-y-6">
            <div>
                 <label className="font-semibold block mb-2 text-text-primary">Daily Water Intake (Liters)</label>
                 <div className="grid grid-cols-4 gap-2">
                     {[1, 2, 3, 4].map(amount => (
                         <button key={amount} onClick={() => handleChange('waterIntake', amount)} className={`p-3 border-2 rounded-lg font-semibold transition-colors ${formData.waterIntake === amount ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary hover:border-gray-400'}`}>
                             {amount}L+
                         </button>
                     ))}
                 </div>
            </div>
             <div>
                 <label className="font-semibold block mb-2 text-text-primary">Activity Level</label>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                     {(['sedentary', 'light', 'moderate', 'active'] as const).map(level => (
                         <button key={level} onClick={() => handleChange('activityLevel', level)} className={`p-3 border-2 rounded-lg capitalize font-semibold transition-colors text-sm ${formData.activityLevel === level ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary hover:border-gray-400'}`}>
                             {level}
                         </button>
                     ))}
                 </div>
            </div>
             <div>
                 <label className="font-semibold block mb-2 text-text-primary">Average Sleep (Hours)</label>
                 <input type="range" min="4" max="10" step="0.5" value={formData.sleepHours || 7} onChange={e => handleChange('sleepHours', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                 <div className="text-center font-bold text-primary mt-2">{formData.sleepHours || 7} hours</div>
            </div>
        </div>
    </div>
);

const InputField = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="font-semibold block mb-1 text-text-primary">{label}</label>
        <input {...props} className="w-full p-3 border rounded-lg bg-white text-text-primary" />
    </div>
);

export default HealthProfileSetup;