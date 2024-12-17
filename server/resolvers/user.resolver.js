import { users } from "../dummyData/data";
import User from "../models/user.model";
import bcrypt from "bcryptjs";

const userResolver = {
    Mutation: {
        signUp: async (_, { input }, context) => {
            try {
                const { username, name, password, gender } = input;
                if (!username || !name || !password || !gender) {
                    throw new Error("All fields are required")
                }

                const existingUser = User.findOne({ username });
                if (existingUser) {
                    throw new Error("User already exists")
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // https://avatar-placeholder.iran.liara.run/
                const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
                const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

                const newUser = new User({
                    username,
                    name,
                    password: hashedPassword,
                    gender,
                    profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
                })

                await newUser.save();
                await context.login(newUser);
                return newUser;

            } catch (err) {
                console.error("Error in signUp:", err);
                throw new Error(err.message || "Internal server error")
            }
        },

        login: async (_, { input }, context) => {
            try {
                const { username, password } = input;
                if (!username || !password) {
                    throw new Error("Invalid username and password")
                }
                const { user } = await context.authenticate("graphql-local", { username, password })
                await context.login(user)
                return user

            } catch (error) {
                console.error("Error in login:", error)
                throw new Error(error.message || "Internal server error")
            }
        },

        logout: async (_, __, context) => {
            try {
                await context.logout();
                context.req.session.destroy((err) => {
                    if (err) throw err;
                });
                context.res.clearCookie("connect.sid");

                return { message: "Logged Out Successfully" }
            } catch (error) {
                console.error("Error in logout:", error)
                throw new Error(error.message || "Internal server error")
            }
        }
    },
    Query: {
        authUser: async (_, __, context) => {
            try {
                const user = await context.getUser();
                return user;
            } catch (error) {
                console.error("Error in getting authenticated user:", error)
                throw new Error("Internal server error")

            }
        },
        user: async (_, { userId }) => {
            try {
                const user = User.findById(userId);
                return user;

            } catch (error) {
                console.error("Error in user query:", error)
                throw new Error(err.message || "Error getting user")
            }
        }
    }
}