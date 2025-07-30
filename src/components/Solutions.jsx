import CodeBlock from "./CodeBlock";



const Solutions = ({problem})=>{
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-white ">Please Try Yourself First</h1>
            <h2 className="text-xl font-bold mb-4 text-white ">Solutions</h2>
            <div className="space-y-8"> {/* Increased spacing for better separation */}
                {problem.referenceSolution?.map((solution, index) => (
                    <div key={index}>
                        {/* Optional: Add a title for each solution approach */}
                        <h3 className="text-lg font-semibold mb-2">{solution.title}</h3>
                                            
                        {/* Use the CodeBlock component here */}
                        <CodeBlock 
                            language={solution.language}
                            code={solution.completeCode} // <-- Key Correction: Use `solution.code`
                        />
                                        </div>
                )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
            </div>
        </div>
    )
}

export default Solutions ;