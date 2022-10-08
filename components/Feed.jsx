import { SparklesIcon } from '@heroicons/react/outline';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import Input from './Input';
import Post from './Post';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    console.log(posts)

    useEffect(() => (
        onSnapshot(
            query(collection(db, "posts"), orderBy("timestamp", "desc")),
            (snapshot) => {
                setPosts(snapshot.docs);
            }
        )
    ), []);

    return (
        <div className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl
            sm:ml-[73px] xl:ml-[380px]
        '>
            <div className='text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 bg-black border-b border-gray-700'>
                <h2 className='font-bold text-lg sm:text-xl'>Home</h2>
                <div className='hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0 xl:py-2'>
                    <SparklesIcon className='h-full text-white' />
                </div>
            </div>

            <Input />

            <div className="pb-72">
                {posts.map(post => (
                    <Post key={post.id} id={post.id} post={post.data()} />
                ))}
            </div>
        </div>
    );
}

export default Feed;
