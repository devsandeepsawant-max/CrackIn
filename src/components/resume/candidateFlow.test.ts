import { describe, expect, it, vi } from 'vitest'
import { ServiceNotConfiguredError, interviewService } from '../../services/interview'
import {
  CANDIDATE_LIMITS, CandidateFlowError, CandidateValidationError,
  createCandidateSession, validateCandidate, validateResume, type CandidateDraft,
} from './candidateFlow'
import { job, resume, resumeFile, services, session } from './__tests__/fixtures'
import { isMatchAnalysis } from '../analysis/MatchAnalysisView'
import { analysis } from './__tests__/fixtures'

describe('candidate input validation', () => {
  it('requires a resume, job title, and non-whitespace description', () => {
    expect(Object.keys(validateCandidate({ file: null, title: '  ', company: '', description: '\n ' }))).toEqual(['file', 'title', 'description'])
  })
  it.each([
    ['resume.pdf', 'application/pdf'],
    ['RESUME.PDF', 'application/pdf'],
    ['resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['resume.pdf', ''],
    ['resume.docx', 'application/octet-stream'],
  ])('accepts %s with a compatible browser MIME', (name, type) => {
    expect(validateResume({ name, type, size: 1024 })).toBeUndefined()
  })
  it.each([
    { name: 'resume.doc', type: 'application/msword', size: 100 },
    { name: 'resume.pdf.exe', type: 'application/pdf', size: 100 },
    { name: 'photo.pdf', type: 'image/png', size: 100 },
    { name: 'resume.docx', type: 'application/pdf', size: 100 },
    { name: 'empty.pdf', type: 'application/pdf', size: 0 },
    { name: 'large.pdf', type: 'application/pdf', size: CANDIDATE_LIMITS.fileBytes + 1 },
  ])('rejects unsupported, empty, mismatched or oversized file metadata: $name', file => {
    expect(validateResume(file)).toBeTruthy()
  })
  it('accepts the exact size limit, and rejects excessive text', () => {
    expect(validateResume({ name: 'resume.pdf', type: '', size: CANDIDATE_LIMITS.fileBytes })).toBeUndefined()
    const errors = validateCandidate({ file: resumeFile(), title: 'a'.repeat(121), company: 'b'.repeat(121), description: 'c'.repeat(20_001) })
    expect(Object.keys(errors)).toEqual(['title', 'company', 'description'])
  })
})

describe('candidate service orchestration', () => {
  const input = () => ({ file: resumeFile(), title: ' Frontend Developer ', company: ' ', description: ' Build accessible React interfaces. ' })
  it('validates before any network call', async () => {
    const service = services()
    await expect(createCandidateSession(service, { ...input(), file: null }, {})).rejects.toBeInstanceOf(CandidateValidationError)
    expect(service.uploadResume).not.toHaveBeenCalled()
  })
  it('calls real adapter methods in order, with returned IDs and trimmed values', async () => {
    const service = services()
    const onStep = vi.fn()
    const onProgress = vi.fn()
    service.uploadResume.mockImplementationOnce(async (_file, report) => { report?.(46); return resume })
    await expect(createCandidateSession(service, input(), {}, { onStep, onProgress })).resolves.toEqual(session)
    expect(onStep.mock.calls.map(([step]) => step)).toEqual(['upload', 'job', 'session'])
    expect(onProgress).toHaveBeenCalledExactlyOnceWith(46)
    expect(service.createJobDescription).toHaveBeenCalledExactlyOnceWith({ title: job.title, company: null, description: job.description })
    expect(service.createSession).toHaveBeenCalledExactlyOnceWith({ resume_id: resume.id, job_description_id: job.id })
  })
  it('reuses confirmed steps for a same-input retry after a save fails', async () => {
    const service = services()
    service.createJobDescription.mockRejectedValueOnce(new Error('temporary failure'))
    const draft: CandidateDraft = {}
    const data = input()
    await expect(createCandidateSession(service, data, draft)).rejects.toMatchObject({ step: 'job' })
    await expect(createCandidateSession(service, data, draft)).resolves.toEqual(session)
    expect(service.uploadResume).toHaveBeenCalledTimes(1)
    expect(service.createJobDescription).toHaveBeenCalledTimes(2)
    expect(service.createSession).toHaveBeenCalledTimes(1)
  })
  it('reuses a confirmed session and invalidates the draft when input changes', async () => {
    const service = services(), data = input(), draft: CandidateDraft = {}
    await createCandidateSession(service, data, draft)
    await createCandidateSession(service, data, draft)
    expect(service.createSession).toHaveBeenCalledTimes(1)
    await createCandidateSession(service, { ...data, title: 'New role' }, draft)
    expect(service.uploadResume).toHaveBeenCalledTimes(2)
    expect(service.createSession).toHaveBeenCalledTimes(2)
  })
  it('stops after upload failure and does not expose raw service errors', async () => {
    const service = services()
    service.uploadResume.mockRejectedValueOnce(new Error('internal service detail'))
    await expect(createCandidateSession(service, input(), {})).rejects.toEqual(new CandidateFlowError('upload'))
    expect(service.createJobDescription).not.toHaveBeenCalled()
    expect(service.createSession).not.toHaveBeenCalled()
  })
  it('fails closed with the real, unconfigured adapter', async () => {
    await expect(createCandidateSession(interviewService, input(), {})).rejects.toBeInstanceOf(ServiceNotConfiguredError)
  })
})

describe('analysis response guard', () => {
  it('accepts an actual complete response, including a zero score and empty lists', () => {
    expect(isMatchAnalysis(analysis)).toBe(true)
    expect(isMatchAnalysis({ ...analysis, overall_match_score: 0, matched_skills: [], missing_or_unproven_skills: [], strengths: [], improvement_suggestions: [] })).toBe(true)
  })
  it.each([-1, 101, NaN, Infinity, '68', null])('rejects invalid score %s', score => {
    expect(isMatchAnalysis({ ...analysis, overall_match_score: score })).toBe(false)
  })
  it('rejects malformed evidence and incomplete responses', () => {
    expect(isMatchAnalysis({ ...analysis, matched_skills: [{ skill: 'React', evidence: '' }] })).toBe(false)
    expect(isMatchAnalysis({ ...analysis, missing_or_unproven_skills: [{ skill: 'React' }] })).toBe(false)
    expect(isMatchAnalysis({ overall_match_score: 70 })).toBe(false)
  })
})
