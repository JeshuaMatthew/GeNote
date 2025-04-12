interface NoteData{
    title : string,
    color : string
    body : string
}

const Note : React.FC<NoteData> = (props) => {
  const noteBgStyle : string = "bg-[#"+props.color+"] h-[280px] md:h-[300px] w-[180px] md:w-[300px] flex flex-col space-y-3 py-4 px-7 rounded-lg overflow-clip justify-center prose"
  return (
    <div className={noteBgStyle}>
        <p className="text-center text-lg">{props.title}</p>
        <p className="h-11/12">{props.body}</p>
    </div>
  )
}

export default Note