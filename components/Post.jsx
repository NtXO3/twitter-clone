import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { modalState, postIdState } from '../atoms/modalAtom';
import { ChartBarIcon, ChatIcon, DotsHorizontalIcon, HeartIcon, ShareIcon, SwitchHorizontalIcon, TrashIcon } from '@heroicons/react/outline';
import { HeartIcon as HeartIconFilled } from '@heroicons/react/solid'
import { useSession } from 'next-auth/react';
import Moment from 'react-moment';
import { useRecoilState } from 'recoil';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import Image from 'next/image';

const Post = ({ post, id, postPage }) => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useRecoilState(modalState);
    const [comments, setComments] = useState([]);
    const [postId, setPostId] = useRecoilState(postIdState);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState([]);
    const router = useRouter();

    const likePost = async () => {
        if (liked) {
            await deleteDoc(doc(db, 'posts', id, "likes", session.user?.uid))
            return setLiked(false)
        }
        await setDoc(doc(db, "posts", id, "likes", session.user?.uid), {
            username: session.user?.name,
        })
        setLiked(true)
    }   

    useEffect(() => {
        setLiked(likes.findIndex(like => like.id === session?.user.uid) !== -1)
    }, [likes, session])

    useEffect(() => {
        onSnapshot(
            collection(db, "posts", id, "likes"),
            (snapshot) => {
                setLikes(snapshot.docs);
            }
        )
    }, [id]);

    useEffect(() => {
        onSnapshot(
            query(collection(db, "posts", id, "comments"), orderBy("timestamp", "desc")),
            (snapshot) => {
                setComments(snapshot.docs);
            }
        )
    }, [id]);

    const redirectToUser = (e) => {
        e.stopPropagation();
        if (!session.user) {
            return;
        }
        router.push(`/users/${post.id}`)
    }

    return (
        <div className='p-3 flex items-start cursor-pointer border-b border-gray-700' onClick={() => router.push(`/${id}`)}>
            {!postPage && (
                <div className='mr-4 h-11 w-11' onClick={redirectToUser}>
                    <Image src={post?.userImg} alt="Profile" className='rounded-full' width={44} height={44} />
                </div>
            )}

            <div className='flex flex-col space-y-2 w-full'>
                <div className={`flex ${!postPage && 'justify-between'}`}>
                    {postPage && (
                        <div className='mr-4 h-11 w-11' onClick={redirectToUser}>
                            <Image src={post?.userImg} alt="Profile" className='rounded-full' width={44} height={44} />
                        </div>
                    )}
                    <div className='text-[#6e767d]'>
                        <div className='inline-block group' onClick={redirectToUser}>
                            <h4 className={`font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline ${!postPage && 'inline-block'}`}>{post?.username}</h4>
                            <span className={`text-sm sm:text-[15px] ${!postPage && 'ml-1.5'}`}>@{post?.tag}</span>
                        </div>
                        &nbsp;??&nbsp;
                        <span className='hover:underline text-sm sm:text-[15px]'>
                            <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
                        </span>
                        {!postPage && (
                            <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>
                                {post?.text}
                            </p>
                        )}
                    </div>

                    <div className="icon group flex-shrink-0 ml-auto">
                        <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
                    </div>
                </div>
                {postPage && (
                    <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>
                        {post?.text}
                    </p>
                )}
                {post?.image && (
                    <img src={post?.image} alt="Image" className='rounded 2xl max-h[600px] object-cover' />
                )}
                <div className={`text-[#6e767d] flex justify-between w-10/12 ${postPage && 'mx-auto'}`}>
                    <div
                        className="flex items-center space-x-1 group"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPostId(id);
                            setIsOpen(true);
                        }}
                    >
                        <div className="icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10">
                            <ChatIcon className="h-5 group-hover:text-[#1d9bf0]" />
                        </div>
                        {comments?.length > 0 && (
                            <span className="group-hover:text-[#1d9bf0] text-sm">
                                {comments.length}
                            </span>
                        )}
                    </div>

                    {session.user.uid === post?.id ? (
                        <div
                            className="flex items-center space-x-1 group"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteDoc(doc(db, "posts", id));
                                router.push("/");
                            }}
                        >
                            <div className="icon group-hover:bg-red-600/10">
                                <TrashIcon className="h-5 group-hover:text-red-600" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-1 group">
                            <div className="icon group-hover:bg-green-500/10">
                                <SwitchHorizontalIcon className="h-5 group-hover:text-green-500" />
                            </div>
                        </div>
                    )}

                    <div
                        className="flex items-center space-x-1 group"
                        onClick={(e) => {
                            e.stopPropagation();
                            likePost();
                        }}
                    >
                        <div className="icon group-hover:bg-pink-600/10">
                            {liked ? (
                                <HeartIconFilled className="h-5 text-pink-600" />
                            ) : (
                                <HeartIcon className="h-5 group-hover:text-pink-600" />
                            )}
                        </div>
                        {likes.length > 0 && (
                            <span
                                className={`group-hover:text-pink-600 text-sm ${
                                liked && "text-pink-600"
                                }`}
                            >
                                {likes.length}
                            </span>
                        )}
                    </div>

                    <div className="icon group">
                        <ShareIcon className="h-5 group-hover:text-[#1d9bf0]" />
                    </div>
                    <div className="icon group">
                        <ChartBarIcon className="h-5 group-hover:text-[#1d9bf0]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Post;
