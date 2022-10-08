import { CalendarIcon, ChartBarIcon, EmojiHappyIcon, PhotographIcon, XIcon } from '@heroicons/react/outline';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data'
import React, { useRef, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase-config';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useSession } from 'next-auth/react';

const Input = () => {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const filePickerRef = useRef(null);
    const [showEmojis, setShowEmojis] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();

    const addImageToPost = (e) => {
        const reader = new FileReader();
        const file = e.target?.files[0]

        if (file) {
            reader.readAsDataURL(file)
        }

        reader.onload = (readerEvent => {
            setSelectedFile(readerEvent.target.result)
        })
    }

    const sendPost = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const docRef = await addDoc(collection(db, 'posts'), {
            id: session.user.uid,
            username: session.user.name,
            userImg: session.user.image,
            tag: session.user.tag,
            text: input,
            timestamp: serverTimestamp(),
        })

        const imageRef = ref(storage, `posts/${docRef.id}/image`);

        if (selectedFile) {
            await uploadString(imageRef, selectedFile, "data_url")
                .then(async () => {
                    const downloadUrl = await getDownloadURL(imageRef);
                    await updateDoc(doc(db, 'posts', docRef.id), {
                        image: downloadUrl,
                    })
                });
        }

        setIsLoading(false)
        setInput("")
        setSelectedFile(null)
        setShowEmojis(false)
    }

    const addEmoji = (e) => {
        console.log(e)
        const sym = e.unified.split('-');
        let codesArray = [];
        sym.forEach(el => codesArray.push("0x" + el))
        const emoji = String.fromCodePoint(...codesArray)
        setInput(input + emoji)
    }

    React.useEffect(() => {
        const handleClose = () => setShowEmojis(false);

        if (showEmojis) {
            document.addEventListener('click', handleClose)
        } else {
            document.removeEventListener('click', handleClose)
        }

        return () => {
            document.removeEventListener('click', handleClose)  
        }
    }, [showEmojis])

    return (
        <div className={`border-b border-gray-700 p-3 flex space-x-3 ${isLoading && 'opacity-60'}`}>
            <img 
                src={session.user?.image ?? "://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                alt="Profile Image"
                className='h-11 w-11 rounded-full cursor-pointer'
            />
            <div className='w-full divide-y divide-gray-700'>
                <div className={`${selectedFile && "pb-7"} ${input && "space-y-2.5"}`}>
                    <textarea 
                        value={input} 
                        disabled={isLoading}
                        onChange={(e) => setInput(e.target.value)} 
                        rows="2"
                        placeholder="What's happening?"
                        className='bg-transparent outline-none w-full text-[#d9d9d9] text-lg
                            placeholder-gray-500 tracking-wide min-h-[50px]'
                    ></textarea>

                    {selectedFile && (
                        <div className='relative'>
                            <div 
                                onClick={() => setSelectedFile(null)} 
                                className='absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex justify-center items-center top-1 left-1 cursor-pointer'
                            >
                                <XIcon className='text-white h-5' />
                            </div>
                            <img src={selectedFile} alt="Your Uploaded Image" className="rounded-2xl max-h-80 object-contain" />
                        </div>
                    )}
                </div>
                
                {!isLoading && (
                    <div className='flex items-center justify-between pt-2.5'>
                        <div className='flex items-center relative'>
                            <div className='icon' onClick={() => filePickerRef.current.click()}>
                                <PhotographIcon className='h-[22px] text-[#1d9bf0]' />
                                <input type="file" hidden onChange={addImageToPost} ref={filePickerRef} />
                            </div>

                            <div className="icon rotate-90">
                                <ChartBarIcon className="text-[#1d9bf0] h-[22px]" />
                            </div>

                            <div className="icon" onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojis(!showEmojis)
                            }}>
                                <EmojiHappyIcon className="text-[#1d9bf0] h-[22px]" />
                            </div>

                            <div className="icon">
                                <CalendarIcon className="text-[#1d9bf0] h-[22px]" />
                            </div>

                            {showEmojis && (
                                <div className='absolute bottom-0 translate-y-[100%] z-10' onClick={(e) => e.stopPropagation()}>
                                    <Picker 
                                        data={data}
                                        onEmojiSelect={addEmoji}
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
                            disabled={!input.trim().length > 0 && !selectedFile}
                            onClick={sendPost}
                        >
                            Tweet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Input;
