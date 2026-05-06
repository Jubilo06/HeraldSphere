import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.mjs";

export default function (passport) {
  console.log("Passport Config: Initializing Passport strategies..."); // This should still appear on server start
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        console.log(
          "Passport Local Strategy: Attempting authentication for:",
          username,
        );
        try {
          const user = await User.findOne({ username: username });
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }
          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect password." });
          }
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      // --- THIS IS THE CRITICAL SECTION FOR LOGS ---
      console.log("Passport JWT Strategy: STARTING verification.");
      console.log("Passport JWT Strategy: JWT Payload received:", jwt_payload); // <--- IS THIS LOG APPEARING?

      // IMPORTANT: Verify `process.env.JWT_SECRET` here too for consistency!
      console.log(
        "Passport JWT Strategy: Using JWT_SECRET:",
        process.env.JWT_SECRET ? "******" : "UNDEFINED",
      ); // DO NOT LOG THE ACTUAL SECRET

      try {
        if (!jwt_payload || !jwt_payload.id) {
          console.log("Passport JWT Strategy: Payload ID missing or invalid.");
          return done(null, false, {
            message: "Invalid token payload: User ID missing.",
          });
        }
        const user = await User.findById(jwt_payload.id);
        if (user) {
          console.log(
            "Passport JWT Strategy: User found for ID:",
            jwt_payload.id,
          );
          return done(null, {
            _id: user._id,
            username: user.username,
            role: user.role,
            profilePic: user.profilePic, 
            firstName: user.firstName, 
            lastName: user.lastName, 
          });
        } else {
          console.log(
            "Passport JWT Strategy: User NOT found in DB for ID:",
            jwt_payload.id,
          );
          return done(null, false, {
            message: "User specified in token payload not found in database.",
          });
        }
      } catch (error) {
        console.error(
          "Passport JWT strategy:Error during verification or DB lookup:",
          error,
        );
        return done(error, false, {
          message: "Internal server error during token verification.",
        });
      }
    }),
  );
}
console.log("Passport Config: Strategies initialized.");