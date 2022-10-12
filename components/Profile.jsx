import { CalendarIcon, CalendarDaysIcon } from '@heroicons/react/outline';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React from 'react';
import Moment from 'react-moment';
import { db } from '../firebase-config';

const Profile = ({ user }) => {
    const { data: session } = useSession();
    const isFollowing = user?.followers?.includes(session?.user.uid);

    const handleFollow = async () => {
        if (isFollowing) {
            await updateDoc(doc(db, "users", user.uid), {
                followers: arrayRemove(session?.user.uid),
            })
            await updateDoc(doc(db, "users", session?.user.uid), {
                following: arrayRemove(session?.user.uid)
            })
            return;
        }
        await updateDoc(doc(db, "users", user.uid), {
            followers: arrayUnion(session?.user.uid)
        })
        await updateDoc(doc(db, "users", session?.user.uid), {
            following: arrayUnion(session?.user.uid)
        })
    }

    return (
        <div className='flex flex-col w-full border-b border-gray-700 pb-8'>
            {user?.banner ? (
                <div className='w-full h-11'>

                </div>   
            ) : (
                <div className='w-full h-48 bg-[#333639]'>
                    
                </div>
            )}
            <div className='flex justify-end py-3 px-5 relative mb-4 h-15 items-start'>
                {user.uid === session.user?.uid ? (
                    <button className='border-gray-700 border text-[#d9d9d9] font-semibold rounded-full px-4 py-1 hover:bg-gray-900 flex items-center justify-center'>
                        Edit Profile
                    </button>
                ) : (
                    <button 
                        className={`border-gray-700 border text-[#d9d9d9] font-semibold rounded-full 
                        px-4 py-1 hover:bg-gray-900 flex items-center justify-center ${isFollowing && 'bg-gray-900'}`}
                        onClick={handleFollow}
                    >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                )}
                <div className='absolute left-5 top-0 translate-y-[-50%] border-[4px] border-gray-900 rounded-full'>
                    <img
                        src={user.image}
                        alt="Profile Image"
                        className='rounded-full'
                    />
                </div>
            </div>
            <div className='text-[#6e767d] px-5'>
                <h4 className='font-bold text-lg text-[#d9d9d9]'>
                    {user.name}
                </h4>
                <span className='text-sm sm:text-[15px] block mb-2'>@{user?.tag}</span>
                {user?.description && (
                    <p className='text-sm sm:text=[15px] block mb-2 text-[#d9d9d9]'>
                        {user.description}
                    </p>
                )}
                <p className='text-sm sm:text-[15px] flex items-center'>
                    <CalendarIcon className='h-4 mr-1' /> Joined in&nbsp;<Moment format="MMMM YYYY">{user?.createdAt?.seconds * 1000}</Moment>
                </p>
                <div className='flex items-center text-sm gap-x-4 mt-3'>
                    <div className='flex items-center'>
                        <h4 className='font-semibold text-[#d9d9d9] mr-1'>{(user?.following || []).length}</h4>
                        <span>Following</span>
                    </div>
                    <div className='flex items-center'>
                        <h4 className='font-semibold text-[#d9d9d9] mr-1'>{(user?.followers || []).length}</h4>
                        <span>Followers</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
