const { GoogleGenAI, Type } = require("@google/genai")
const { z } = require("zod")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY
})

const interviewReportGoogleSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        title: {
            type: Type.STRING,
            description: "The title of the job for which the interview report is generated"
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question" },
                    intention: { type: Type.STRING, description: "The interviewer's intention behind this question" },
                    answer: { type: Type.STRING, description: "How to answer this question" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The behavioral question" },
                    intention: { type: Type.STRING, description: "The interviewer's intention behind this question" },
                    answer: { type: Type.STRING, description: "How to answer this question" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill which the candidate is lacking" },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Severity of this skill gap" }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "A day-wise preparation plan for the candidate",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "Day number, starting from 1" },
                    focus: { type: Type.STRING, description: "Main focus of this day" },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tasks to do on this day" }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportGoogleSchema,
        }
    })

    return JSON.parse(response.text)

}


const resumeGoogleSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A short 2-3 sentence professional summary tailored to the job description" },
        skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of relevant skills to highlight" },
        experience: {
            type: Type.ARRAY,
            description: "Work / project experience relevant to the job",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "Job title / role" },
                    organization: { type: Type.STRING, description: "Company, organization, or project name" },
                    duration: { type: Type.STRING, description: "Duration, e.g. 'Jan 2024 - Present'" },
                    highlights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points describing impact" }
                },
                required: ["role", "organization", "duration", "highlights"]
            }
        },
        education: {
            type: Type.ARRAY,
            description: "Educational background",
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    duration: { type: Type.STRING }
                },
                required: ["degree", "institution", "duration"]
            }
        }
    },
    required: ["summary", "skills", "experience", "education"]
}

async function generateResume({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate a tailored resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Return the resume as structured JSON matching the given schema.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience.
                        The content should not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeGoogleSchema,
        }
    })

    return JSON.parse(response.text)
}

module.exports = { generateInterviewReport, generateResume }