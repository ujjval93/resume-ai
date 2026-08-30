import { createContext,useState } from "react";


export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [resume, setResume] = useState(null)

    return (
        <InterviewContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports, resume, setResume }}>
            {children}
        </InterviewContext.Provider>
    )
}