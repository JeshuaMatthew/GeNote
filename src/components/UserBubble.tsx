import ReactMarkdown from "react-markdown";

const colorDark = '#A84C4C';

interface UserPrompt{
    prompt : string
}


const UserBubble : React.FC<UserPrompt> = (UserPrompt) => {
  return (
     <div className="mb-2 text-right">
     <ReactMarkdown className={`inline-block bg-[${colorDark}] text-white text-sm p-2 rounded-lg max-w-[80%] sm:max-w-[70%] prose`}> 
       {UserPrompt.prompt}
     </ReactMarkdown>
   </div>
  )
}

export default UserBubble