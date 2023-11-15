import type { ChangeEventHandler, HTMLInputTypeAttribute } from "react"

type Props = {
    name?:string | undefined, 
    visibleName?:string | undefined, 
    type?:HTMLInputTypeAttribute,
    onChange?: ChangeEventHandler<HTMLInputElement>,
    value?: string | number | readonly string[]
}

export default function TextInput({name, type, visibleName, onChange, value}:Props) {
  return (
    <div className='grid gap-1'>
        <div>{visibleName ?? name+": "}</div>
        <input name={name} type={type} onChange={onChange} value={value}  className='text-black px-1 py-0.5 rounded-md'/>
    </div>
  )
}
