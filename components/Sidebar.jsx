import Image from 'next/image';
import React from 'react';

import { HomeIcon } from "@heroicons/react/solid";
import {
    HashtagIcon,
    BellIcon,
    InboxIcon,
    BookmarkIcon,
    ClipboardListIcon,
    UserIcon,
    DotsCircleHorizontalIcon,
    DotsHorizontalIcon,
} from "@heroicons/react/outline";

import SidebarLink from './SidebarLink';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar = () => {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div className='hidden sm:flex flex-col items-center xl:items-start xl:w-[340px] p-2 fixed
        h-full xl:ml-24'>
            <div onClick={() => router.push('/')} className='flex items-center justify-center w-14 h-14 hoverAnimation p-0'>
                <Image src="https://rb.gy/ogau5a" alt="Twitter Logo" width={30} height={30} />
            </div>

            {/* Links */}
            <div className='space-y-2 mt-4 mb-2.5'>
                <SidebarLink to="/" text="Home" icon={HomeIcon} active={router.asPath === "/"} />
                <SidebarLink text="Explore" icon={HashtagIcon} />
                <SidebarLink text="Notifications" icon={BellIcon} />
                <SidebarLink text="Message" icon={InboxIcon} />
                <SidebarLink text="Bookmarks" icon={BookmarkIcon} />
                <SidebarLink text="Lists" icon={ClipboardListIcon} />
                <SidebarLink text="Profile" icon={UserIcon} to={`/users/${session.user.uid}`} active={router.asPath === `/users/${session.user.uid}`} />
                <SidebarLink text="More" icon={DotsCircleHorizontalIcon} />
            </div>
            <button className='hidden xl:inline text-white mr-auto bg-[#1d9bf0] rounded-full
                w-56 h-[52px] text-lg font-bold shadow-md hover:bg-[#1a8cd8]
            '>
                Tweet
            </button>
            <div className='text-[#d9d9d9] flex items-center justify-center hoverAnimation mt-auto max-w-56' onClick={signOut}>
                <img 
                    src={session.user?.image ?? "://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                    alt="Profile Image"
                    className='h-10 w-10 rounded-full xl:mr-2.5'
                />
                <div className='hidden xl:inline leading-5'>
                    <h4 className='font-bold text-ellipsis w-20 overflow-hidden whitespace-nowrap'>{session.user?.name}</h4>
                    <p className='text-[#6e767d]'>@{session.user?.tag}</p>
                </div>
                <DotsHorizontalIcon className='h-5 hidden xl:block ml-10' />
            </div>
        </div>
    );
}

export default Sidebar;