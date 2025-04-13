import ReactMarkdown from "react-markdown";

const colorDark = '#A84C4C';
const colorMedium = '#DEB7B7';

interface GeminiAns{
    Ans : string
}

const GeminiBubble : React.FC<GeminiAns> = (geminiAns) => {
  return (
    <div className="mb-2 text-left">
        <ReactMarkdown className={`inline-block bg-[${colorMedium}] text-[${colorDark}] text-sm p-2 rounded-lg max-w-[80%] sm:max-w-[70%] prose`}>
        {geminiAns.Ans}
        </ReactMarkdown>
    </div>
  )
}

export default GeminiBubble