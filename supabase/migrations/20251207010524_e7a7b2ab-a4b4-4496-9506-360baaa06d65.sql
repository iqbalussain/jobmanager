-- First migration: Add new status values to job_status enum
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'out';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'foc_sample';