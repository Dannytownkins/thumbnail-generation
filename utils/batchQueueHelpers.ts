import { BatchJob } from '../types';

export const resolveJobSettings = (job: BatchJob) => {
  const aspectRatio = job.overrides?.aspectRatio ?? job.settings.aspectRatio;
  const numberOfImages = job.overrides?.numberOfImages ?? job.settings.numberOfImages;

  return {
    aspectRatio,
    numberOfImages,
  };
};

export const reorderJobList = (
  jobs: BatchJob[],
  sourceId: string,
  targetId: string,
): BatchJob[] => {
  const sourceIndex = jobs.findIndex((job) => job.id === sourceId);
  const targetIndex = jobs.findIndex((job) => job.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return jobs;
  }

  const next = [...jobs];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
};

