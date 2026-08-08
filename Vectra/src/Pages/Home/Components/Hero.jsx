import React, { useActionState, useEffect } from 'react'
import { useState } from 'react'

const Hero = () => {
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [text3, setText3] = useState("");

    const [aiDone, setAiDone] = useState(false);
    const [keysDone, setKeysDone] = useState(false);
    const [cycle, setCycle] = useState(0);


    useEffect(()=>{
        let index = 0

        setText1("")
        
        const fullText1 = "Your AI"
    
        const inteval = setInterval(() => {
            setText1(fullText1.slice(0,index+1))
            index++;

            if(index === fullText1.length){
                clearInterval(inteval)
                setAiDone(true);
            }
        }, 50);

        return () => clearInterval(inteval)
    }, [cycle])

    useEffect(()=>{
        if(!aiDone){
            return
        }
        
        let index = 0

        setText2("")
        const fullText2 = "Your Keys"
        const interval = setInterval(() => {
            setText2(fullText2.slice(0,index+1))
            index++;

            if(index === fullText2.length){
                clearInterval(interval)
                setKeysDone(true)
            }
        }, 50);

        return () => clearInterval(interval)
    },[aiDone, cycle])

    useEffect(()=>{

        if(!keysDone){
            return
        }

        let index = 0

        setText3("")

        const fullText3 = "Your Control"
        const interval = setInterval(() => {
            setText3(fullText3.slice(0,index+1))
            index++;

            if(index === fullText3.length){
                clearInterval(interval)
                
                setTimeout(() => {
                    setText1("")
                    setText2("")
                    setText3("")

                    setAiDone(false)
                    setKeysDone(false)

                    setCycle(prev=> prev+1)
                }, 700);
            }
        }, 50);

        return () => clearInterval(interval)
    },[keysDone, cycle])


  return (
    <div className='px-10 py-20 min-h-[3em]'>
        <div>
            <p className='mb-6 text-sm tracking-[0.3em] text-white/50'>THE AI WORKSPACE</p>
            <div className='text-8xl font-bold leading-[0.85] tracking-tight text-white flex flex-col gap-4'>
                <h2>{text1}</h2>
                <h2>{text2}</h2>
                <h2>{text3}</h2>
            </div>
            <div className='flex flex-col gap-3 py-10'>
                <h3 className='text-2xl text-pink-700'>One workspace for every model you use.
                </h3>
                <button className='bg-green-700 p-2 rounded-xl cursor-pointer font-medium w-36'>Get Started</button>
            </div>
        </div>
    </div>
  )
}

export default Hero