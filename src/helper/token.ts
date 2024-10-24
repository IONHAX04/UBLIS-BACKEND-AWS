import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { request } from "http";
import { ResponseToolkit } from "@hapi/hapi";

dotenv.config();

// Validate environment variables
if (!process.env.ACCESS_TOKEN) {
  throw new Error("ACCESS_TOKEN environment variable is not defined.");
}

// Constants
const TOKEN_EXPIRATION = "20m"; // Define token expiration as a constant

// Function to generate a token
function generateToken(tokenData: object, action: boolean): string | object {
  if (action) {
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN as string, {
      expiresIn: TOKEN_EXPIRATION,
    });
    return token;
  } else {
    return tokenData;
  }
}

function generateToken1(tokenData: object, action: boolean): string | object {
  if (action) {
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN as string, {
      // Do not set `expiresIn` for an infinite token lifespan
    });
    return token;
  } else {
    return tokenData;
  }
}

// Function to decode a token
function decodeToken(token: string): JwtPayload | { error: string } {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string);
    if (typeof decoded === "string") {
      return { error: "Invalid token format" };
    }
    return decoded; // Return decoded token data (JwtPayload)
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
}

function validateToken(request: any, h: ResponseToolkit) {
  const authHeader = request.headers.authorization;
  console.log("authHeader", authHeader);
  if (!authHeader) {
    return h.response({ error: "Token missing" }).code(401).takeover();
  }
  const token = authHeader.split(" ")[1];
  console.log("token", token);
  const decodedToken = decodeToken(token);
  console.log("decodedToken line---------------------61", decodedToken);
  request.plugins.token = decodedToken;

  return h.continue;
}

export { decodeToken, generateToken, validateToken, generateToken1 };
