import { ArrowLeftIcon } from "@heroicons/react/outline";
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { getProviders, getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { modalState } from "../../atoms/modalAtom";
import Feed from "../../components/Feed";
import Login from "../../components/Login";
import Post from "../../components/Post";
import Modal from '../../components/Modal';
import Profile from "../../components/Profile";
import Sidebar from "../../components/Sidebar";
import Widgets from "../../components/Widgets";
import { db } from "../../firebase-config";

const UserPage = ({ trendingResults, followResults, providers }) => {
    const router = useRouter();
    const { uid } = router.query;
    const { data: session } = useSession();
    const [userPosts, setUserPosts] = useState([]);
    const [user, setUser] = useState({});
    const [isOpen, setIsOpen] = useRecoilState(modalState);

    useEffect(() => {
        onSnapshot(doc(db, "users", uid), (snapshot) => {
            setUser(snapshot.data())
        })
    }, [uid])

    useEffect(() => {
        onSnapshot(
            query(collection(db, "posts"), orderBy("timestamp", "desc")),
            (snapshot) => {
                const filteredPosts = snapshot.docs.filter(doc => doc.data().id === uid)
                return setUserPosts(filteredPosts)
            }
        )
    }, [uid]);

    if (!session) {
        return <Login providers={providers} />
    }

    return (
        <div className="bg-black">
            <Head>
                <title>{session?.user.name} on Twitter</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
                <Sidebar />
                <div className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[380px]'>
                    <div className='flex items-center px-1.5 py-2 border-b border-gray-700 text-[#d9d9d9] font-semibold text-md gap-x-4 sticky top-0 z-10 bg-black'>
                        <div 
                            className='hoverAnimation w-9 h-9 flex items-center justify-center xl:px-0'
                            onClick={() => router.push('/')}
                        >
                            <ArrowLeftIcon className='h-5 text-white' />
                        </div>
                        {user.name}
                    </div>
                    <Profile user={user} />
                    <div className="pb-72">
                        {userPosts.map(post => (
                            <Post key={post.id} id={post.id} post={post.data()} />
                        ))}
                    </div>
                </div>
                <Widgets followResults={followResults} trendingResults={trendingResults} />
                {isOpen && <Modal />}
            </main>
        </div>
    )
}

export default UserPage;

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