import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db";
import { Clerk } from "@clerk/clerk-sdk-node";
import { env } from "~/env.mjs";

const clerk = Clerk({ apiKey: env.CLERK_API_KEY });

export default async function dan(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // Get user data from request body
      const user = await clerk.users.getUser(req.body.data.id);
      //   console.log(user, "WEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEBHOOK");

      // Check if user already exists in your database
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Add user to your database using Prisma
      const newUser = await prisma.user.create({
        data: {
          // You'll need to adjust this depending on your database schema
          id: user.id,
          bio: (user.publicMetadata?.bio as string) ?? "",
          createdAt: user.createdAt.toString(),
        },
      });

      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      // Something went wrong
      // @ts-ignore
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
