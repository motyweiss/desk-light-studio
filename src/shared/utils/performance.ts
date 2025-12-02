import { logger } from './logger';

/**
 * Performance monitoring utilities
 */

interface PerformanceMark {
  name: string;
  startTime: number;
}

const marks = new Map<string, PerformanceMark>();

/**
 * Start a performance measurement
 */
export const perfStart = (name: string): void => {
  const startTime = performance.now();
  marks.set(name, { name, startTime });
  logger.performance(`▶️ ${name} started`);
};

/**
 * End a performance measurement and log duration
 */
export const perfEnd = (name: string): number => {
  const mark = marks.get(name);
  if (!mark) {
    logger.warn(`Performance mark "${name}" not found`);
    return 0;
  }

  const duration = performance.now() - mark.startTime;
  marks.delete(name);
  
  logger.performance(`⏱️ ${name} completed in ${duration.toFixed(2)}ms`);
  return duration;
};

/**
 * Measure the execution time of an async function
 */
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  perfStart(name);
  try {
    const result = await fn();
    perfEnd(name);
    return result;
  } catch (error) {
    perfEnd(name);
    throw error;
  }
};

/**
 * Measure the execution time of a sync function
 */
export const measure = <T>(name: string, fn: () => T): T => {
  perfStart(name);
  try {
    const result = fn();
    perfEnd(name);
    return result;
  } catch (error) {
    perfEnd(name);
    throw error;
  }
};

/**
 * Debounce performance measurements to avoid spam
 */
const measurementCache = new Map<string, number>();
const DEBOUNCE_TIME = 1000; // 1 second

export const perfMeasure = (name: string, value: number, unit = 'ms'): void => {
  const lastLog = measurementCache.get(name);
  const now = Date.now();
  
  if (!lastLog || now - lastLog > DEBOUNCE_TIME) {
    logger.performance(`📊 ${name}: ${value.toFixed(2)}${unit}`);
    measurementCache.set(name, now);
  }
};
