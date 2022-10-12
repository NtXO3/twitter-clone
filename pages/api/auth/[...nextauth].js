import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../firebase-config";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn ({ user, account, profile, email, credentials }) {
        const userDoc = await getDoc(doc(db, "users", user.id));

        if (userDoc.exists()) {
            return true;
        }
        await setDoc(doc(db, "users", user.id), {
            name: user.name,
            tag: user.name.split(" ").join('').toLocaleLowerCase(),
            uid: user.id,
            image: user.image,
            createdAt: serverTimestamp(),
        })
        return true;
    },
    async session ({ session, user, token }) {
        session.user.tag = session.user.name
            .split(" ")
            .join('')
            .toLocaleLowerCase();
        
        session.user.uid = token.sub;
        return session;
    },
  }
}

export default NextAuth(authOptions);