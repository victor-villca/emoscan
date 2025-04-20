import * as emotionRepo from '../repositories/emotion.repository';
import { EmotionReport } from '../models/EmotionReport';
import { EmotionMetric } from '../models/EmotionMetric';
import { EmotionSummary } from '../models/EmotionSummary';
import { EmotionTimeline } from '../models/EmotionTimeline';
import { EmotionTransition } from '../models/EmotionTransition';

export const createReport = async (report: EmotionReport) => emotionRepo.createEmotionReport(report);
export const addMetric = async (metric: EmotionMetric) => emotionRepo.addEmotionMetric(metric);
export const addSummary = async (summary: EmotionSummary) => emotionRepo.createEmotionSummary(summary);
export const addTimeline = async (event: EmotionTimeline) => emotionRepo.addTimelineEvent(event);
export const addTransition = async (event: EmotionTransition) => emotionRepo.addTransitionEvent(event);