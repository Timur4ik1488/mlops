import { RoadmapStep } from '../types';
import { step1 } from './steps/step1';
import { step2 } from './steps/step2';
import { step3 } from './steps/step3';
import { step4 } from './steps/step4';
import { step5 } from './steps/step5';
import { step6 } from './steps/step6';
import { step7 } from './steps/step7';
import { step8 } from './steps/step8';
import { step9 } from './steps/step9';
import { step10 } from './steps/step10';

export const roadmapSteps: RoadmapStep[] = [
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
  step7,
  step8,
  step9,
  step10,
];

export const getStepById = (id: number): RoadmapStep | undefined => {
  return roadmapSteps.find((s) => s.id === id);
};
