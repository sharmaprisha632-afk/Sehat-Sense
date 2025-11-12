
import { Droplet, TestTube, Activity, SlidersHorizontal, Pill, Heart, Scale, Sun, Beaker } from 'lucide-react';
import { ConditionDetails } from './types';

export const CONDITION_DETAILS: ConditionDetails = {
    prediabetes: {
        label: 'Pre-diabetes',
        description: 'Managing blood sugar levels.',
        icon: Droplet,
    },
    diabetes: {
        label: 'Diabetes',
        description: 'Strict blood sugar control.',
        icon: Droplet,
    },
    fatty_liver: {
        label: 'Fatty Liver',
        description: 'Focusing on a low-fat diet.',
        icon: TestTube,
    },
    high_cholesterol: {
        label: 'High Cholesterol',
        description: 'Limiting saturated fats.',
        icon: Activity,
    },
    high_blood_pressure: {
        label: 'High Blood Pressure',
        description: 'Managing sodium and potassium.',
        icon: Heart,
    },
    vitamin_d_deficiency: {
        label: 'Vitamin D Deficiency',
        description: 'Needs Vitamin D rich foods.',
        icon: Sun,
    },
    vitamin_b12_deficiency: {
        label: 'Vitamin B12 Deficiency',
        description: 'Needs Vitamin B12 sources.',
        icon: Beaker,
    },
    pcos_hormonal_imbalance: {
        label: 'PCOS/Hormonal',
        description: 'Balancing hormones via diet.',
        icon: SlidersHorizontal,
    },
    weight_loss_goal: {
        label: 'Weight Loss Goal',
        description: 'Calorie and macro management.',
        icon: Scale,
    },
};
