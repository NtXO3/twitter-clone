import { ArrowLeftIcon } from '@heroicons/react/outline';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getProviders, getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { modalState } from '../atoms/modalAtom';
import Login from '../components/Login';
import Modal from '../components/Modal';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase-config';
import Post from '../components/Post'
import Comment from '../components/Comment';
import Widgets from '../components/Widgets';

const PostPage = ({ providers, trendingResults, followResults }) => {
    const [isOpen, setIsOpen] = useRecoilState(modalState);
    const [post, setPost] = React.useState({});
    const router = useRouter()
    const { id } = router.query;
    const { data: session } = useSession();
    const [comments, setComments] = useState([]);

    useEffect(() => {
        onSnapshot(doc(db, "posts", id), (snapshot) => {
            setPost(snapshot.data())
        })
    }, [id])

    useEffect(() => {
        onSnapshot(
            query(collection(db, "posts", id, "comments"), orderBy("timestamp", "desc")),
            (snapshot) => {
                setComments(snapshot.docs);
            }
        )
    }, [id]);

    if (!session) return <Login providers={providers} />

    return (
        <div className="bg-black">
            <Head>
                <title>{post?.username} on Twitter: &quot;{post.text}&quot;</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className='bg-black min-h-screen flex max-w-[1500px] mx-auto'>
                <Sidebar />
                <div className='flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[380px]'>
                    <div className='flex items-centee px-1.5 py-2 border-b border-gray-700 text-[#d9d9d9] font-semibold text-xl gap-x-4 sticky top-0 z-10 bg-black'>
                        <div 
                            className='hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0'
                            onClick={() => router.push('/')}
                        >
                            <ArrowLeftIcon className='h-5 text-white' />
                        </div>
                        Tweet
                    </div>
                    <Post post={post} id={id} postPage />
                    <div className='pb-72'>
                        {comments.map(comment => (
                            <Comment key={comment.id} id={comment.id} comment={comment.data()} />
                        ))}
                    </div>
                </div>
                <Widgets trendingResults={trendingResults} followResults={followResults} />

                {isOpen && <Modal />}
            </main>
        </div>
    );
}

export default PostPage;

export async function getServerSideProps(context) {
    const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then(
      (res) => res.json()
    );
    const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then(
      (res) => res.json()
    );
    const providers = await getProviders();
    const session = await getSession(context);
  
    return {
        props: {
            trendingResults,
            followResults,
            providers,
            session,
        },
    };
}  