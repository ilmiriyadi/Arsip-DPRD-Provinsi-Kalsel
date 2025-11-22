import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { loginRateLimiter } from "./rateLimit"
// import { logAudit } from "./auditLog" // Temporarily disabled until migration runs

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Rate limiting check
        const rateLimitResult = loginRateLimiter(credentials.email)
        if (!rateLimitResult.allowed) {
          // TODO: Log failed login due to rate limit (after migration)
          // await logAudit({ action: 'FAILED_LOGIN', entity: 'System', ... })
          
          throw new Error(
            `Terlalu banyak percobaan login. Coba lagi dalam ${rateLimitResult.retryAfter} detik.`
          )
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          // TODO: Log failed login - user not found (after migration)
          // await logAudit({ action: 'FAILED_LOGIN', entity: 'User', ... })
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // TODO: Log failed login - invalid password (after migration)
          // await logAudit({ userId: user.id, action: 'FAILED_LOGIN', ... })
          return null
        }

        // TODO: Log successful login (after migration)
        // await logAudit({ userId: user.id, action: 'LOGIN', ... })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}