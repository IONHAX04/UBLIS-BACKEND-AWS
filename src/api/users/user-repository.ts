import { executeQuery, getClient } from "../../helper/db";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { PoolClient } from "pg";
import path from "path";
import { viewFile } from "../../helper/storage";
import {
  checkQuery,
  getCustomerCount,
  insertUserQuery,
  insertUserDomainQuery,
  selectUserByUsername,
  selectUserByEmailQuery,
  insertUserCommunicationQuery,
  updateHistoryQuery,
  selectUserData,
  getSingInCount,
  getFollowUpCount,
  getRegisterResult,
  getUserType,
  getProfileData,
  fetchPresentHealthProblem,
  getCommunicationType,
  updateProfileAddressQuery,
  updateHistoryQuery1,
} from "./query";
import { getUserData as rawGetUserDataQuery } from "./query";
import { encrypt } from "../../helper/encrypt";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken, generateToken1 } from "../../helper/token";

const JWT_SECRET = process.env.ACCESS_TOKEN || "ERROR";

export class UserRepository {
  public async userLoginV1(user_data: any, domain_code?: any): Promise<any> {
    const params = [user_data.username];
    const users = await executeQuery(selectUserByUsername, params); // Execute select query

    if (users.length > 0) {
      const user = users[0];

      // Verify the password
      const validPassword = await bcrypt.compare(
        user_data.password,
        user.refCustHashedPassword
      );
      if (validPassword) {
        const history = [
          2,
          new Date().toLocaleString(), // Using local date and time
          user.refStId,
          "User",
        ];

        const updateHistory = await executeQuery(updateHistoryQuery, history);
        const refStId = [user.refStId];
        const userData = await executeQuery(selectUserData, refStId);

        const signinCount = await executeQuery(getSingInCount, refStId);
        const followUpCount = await executeQuery(getFollowUpCount, refStId);
        const status2 =
          followUpCount.length > 0 ? followUpCount[0].status : null;

        const getRegisterCount = await executeQuery(getRegisterResult, refStId);
        const status3 =
          getRegisterCount.length > 0 ? getRegisterCount[0].status : null;
        let result: boolean = true;
        if (status2 == false || status3 == false) {
          result = false;
        }
        const registerBtn = {
          signUpCount: signinCount[0].result,
          followUpCount: result,
          refUtId: userData,
        };

        if (updateHistory && updateHistory.length > 0) {
          const tokenData = {
            id: user.refStId,
          };

          return encrypt(
            {
              success: true,
              message: "Login successful",
              token: generateToken(tokenData, true),
              data: registerBtn,
            },
            true
          );
        }
      }
    }

    // Return error if user not found or invalid password
    // return { success: false, message: "Invalid email or password" };
    return encrypt(
      {
        success: false,
        message: "Invalid email or password",
      },
      true
    );
  }

  public async userSignUpV1(userData: any, domain_code?: any): Promise<any> {
    const hashedPassword = await bcrypt.hash(userData.temp_su_password, 10);
    const userId = uuidv4();

    const check = [userData.temp_su_username];

    const userCheck = await executeQuery(checkQuery, check);
    const userFind = userCheck[0];

    if (userFind) {
      return encrypt(
        {
          success: false,
          message: "Username Already Exist",
        },
        true
      );
      // return { success: false, message: "Username Already Exist" };
    } else {
      const userCountResult = await executeQuery(getCustomerCount);
      const userCount = parseInt(userCountResult[0].count, 10); // Extract and convert count to a number

      let newCustomerId;
      if (userCount >= 0) {
        newCustomerId = `UBY${(10000 + userCount + 1).toString()}`; // Generate the ID
      }
      let userType = 1;

      const params = [
        userData.temp_su_fname, // refStFName
        userData.temp_su_lname, // refStLName
        userData.temp_su_dob, // refStDOB
        userData.temp_su_age, // refStAge
        newCustomerId,
        (userType = 1),
      ];

      const userResult = await executeQuery(insertUserQuery, params);
      const newUser = userResult[0];

      const domainParams = [
        newUser.refStId, // refStId from users table
        newUser.refSCustId, // refCustId from users table
        userData.temp_su_username, // refcust Username
        userData.temp_su_password, // refCustPassword
        hashedPassword, // refCustHashedPassword
      ];

      const domainResult = await executeQuery(
        insertUserDomainQuery,
        domainParams
      );

      const communicationParams = [
        newUser.refStId, // refStId from users table
        userData.temp_su_phone,
        userData.temp_su_email,
      ];

      const communicationResult = await executeQuery(
        insertUserCommunicationQuery,
        communicationParams
      );

      if (
        userResult.length > 0 &&
        domainResult.length > 0 &&
        communicationResult.length > 0
      ) {
        const history = [
          1,
          new Date().toLocaleString(), // Using local date and time
          newUser.refStId,
          "user",
        ];

        const updateHistory = await executeQuery(updateHistoryQuery, history);

        // Check if the history update was successful
        if (updateHistory && updateHistory.length > 0) {
          const tokenData = {
            id: newUser.refStId, // refStId from users table
            email: userData.temp_su_email,
            custId: newUser.refSCustId,
            status: newUser.refSUserStatus,
          };
          return encrypt(
            {
              success: true,
              message: "User signup successful",
              user: newUser,
              token: generateToken(tokenData, true),
            },
            true
          );
        } else {
          return encrypt(
            {
              success: false,
              message: "Failed to update history",
            },
            true
          );
          // return { success: false, message: "Failed to update history" };
        }
      } else {
        return encrypt(
          {
            success: false,
            message: "Signup failed",
          },
          true
        );
        // return { success: false, message: "Signup failed" };
      }
    }
  }
  public async validateUserNameV1(
    userData: any,
    domain_code?: any
  ): Promise<any> {
    const check = [userData.temp_su_username];

    const userCheck = await executeQuery(checkQuery, check);
    const userFind = userCheck[0];

    if (userFind) {
      return encrypt(
        {
          success: false,
          message: "Username Already Exist",
        },
        true
      );
    } else {
      return encrypt(
        {
          success: true,
          message: "username is unique",
        },
        true
      );
    }
  }

  public async validateUsers(
    userData: any,
    decodedToken: number,
    domain_code?: any
  ): Promise<any> {
    try {
      const refStId = decodedToken;
      const id = [refStId];
      const user = await executeQuery(selectUserData, id);

      const signinCount = await executeQuery(getSingInCount, id);
      const followUpCount = await executeQuery(getFollowUpCount, id);
      const status2 = followUpCount.length > 0 ? followUpCount[0].status : null;

      const getRegisterCount = await executeQuery(getRegisterResult, id);
      const status3 =
        getRegisterCount.length > 0 ? getRegisterCount[0].status : null;
      let result: boolean = true;
      if (status2 == false || status3 == false) {
        result = false;
      }
      const registerBtn = {
        signUpCount: signinCount[0].result,
        followUpCount: result,
        refUtId: userData,
      };

      const tokenData = {
        id: refStId,
        UserType: user,
      };

      const token = generateToken1(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "user Validate Token",
          token: token,
          data: user,
          registerBtn: registerBtn,
        },
        true
      );
    } catch (error) {
      console.error("Error in User Token Validation:", error);
      throw error;
    }
  }
  public async validateTokenData(
    userData: any,
    decodedToken: number,
    domain_code?: any
  ): Promise<any> {
    try {
      const refStId = decodedToken;
      const id = [refStId];
      const user = await executeQuery(selectUserData, id);
      let profileFile;
      if (user[0].refProfilePath) {
        const profileFilePath = user[0].refProfilePath;
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64"); // Convert file to base64 to pass in response
          profileFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "image/jpeg",
          };
        } catch (err) {
          console.error("Error retrieving profile file:", err);
        }
      }

      const tokenData = {
        id: refStId,
        UserType: user[0].refUtId,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "user Validate Token",
          token: token,
          data: user,
          profileFile: profileFile,
        },
        true
      );
    } catch (error) {
      const tokenData = {
        id: decodedToken,
      };

      const token = generateToken(tokenData, true);
      return encrypt(
        {
          success: false,
          message: "user Token Validation Fails",
          token: token,
        },
        true
      );
    }
  }

  public async userDashBoardDataV1(
    userData: any
    // decodedToken: number
  ): Promise<any> {
    try {
      // const refStId = decodedToken;
      const refStId = 78;
      const userType = await executeQuery(getUserType, [refStId]);
      let refDashBoardData = {};

      const tokenData = {
        id: refStId,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "DashBoard Data Passed Successfully",
          token: token,
          data: refDashBoardData,
        },
        false
      );
    } catch (error) {
      console.error("Error in Dashboard Data Passing:", error);
      throw error;
    }
  }
  public async userProfileDataV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const id = decodedToken || 65;
    const tokenData = {
      id: id,
    };

    console.log("-------------------------------------------------");
    let refStId;
    const checkUser = await executeQuery(getUserType, [id]);
    if (checkUser[0].refUtId == 5 || checkUser[0].refUtId == 6) {
      refStId = id;
    } else {
      refStId = userData.refStId;
    }

    const token = generateToken(tokenData, true);
    console.log(
      "token ----------------------------------------------------",
      token
    );
    try {
      let profileData = {};
      const Datas = await executeQuery(getProfileData, [refStId]);
      const Data = Datas[0];
      let addresstype = false;
      if (Data.refAdAdd1Type == 3) {
        addresstype = true;
      }

      function formatDate(isoDate: any) {
        const date = new Date(isoDate); // Create a new Date object
        const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (0-based) and pad with zero
        const year = date.getFullYear(); // Get the full year

        return `${year}-${month}-${day}`; // Return formatted date
      }

      const address = {
        addresstype: addresstype,
        refAdAdd1: Data.refAdAdd1,
        refAdArea1: Data.refAdArea1,
        refAdCity1: Data.refAdCity1,
        refAdState1: Data.refAdState1,
        refAdPincode1: Data.refAdPincode1,
        refAdAdd2: Data.refAdAdd2,
        refAdArea2: Data.refAdArea2,
        refAdCity2: Data.refAdCity2,
        refAdState2: Data.refAdState2,
        refAdPincode2: Data.refAdPincode2,
      };

      profileData = { ...profileData, address };

      const personalData = {
        refSCustId: Data.refSCustId,
        refStFName: Data.refStFName,
        refStLName: Data.refStLName,
        refStMName: Data.refStMName,
        refStDOB: formatDate(Data.refStDOB),
        refStSex: Data.refStSex,
        refStAge: Data.refStAge,
        refQualification: Data.refQualification,
        refOccupation: Data.refOccupation,
        refProfilePath: Data.refProfilePath,
        refguardian: Data.refguardian,
        refUserName: Data.refUserName,
      };

      profileData = { ...profileData, personalData };

      let profileFile = null;
      if (Data.refProfilePath) {
        const profileFilePath = Data.refProfilePath;
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64"); // Convert file to base64 to pass in response
          profileFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "image/jpeg", // Assume JPEG, adjust if necessary
          };
        } catch (err) {
          console.error("Error retrieving profile file:", err);
        }
      }
      profileData = { ...profileData, profileFile }; // Add file to profile data

      const generalhealth = {
        refHeight: Data.refHeight,
        refWeight: Data.refWeight,
        refBlood: Data.refBlood,
        refBMI: Data.refBMI,
        refBP: Data.refBP,
        refRecentInjuries: Data.refRecentInjuries,
        refRecentInjuriesReason: Data.refRecentInjuriesReason,
        refRecentFractures: Data.refRecentFractures,
        refRecentFracturesReason: Data.refRecentFracturesReason,
        refOthers: Data.refOthers,
        refElse: Data.refElse,
      };

      profileData = { ...profileData, generalhealth };

      const presentHealth = {
        refPresentHealth: Data.refPerHealthId,
        refOtherActivities: Data.refOtherActivities,
        refMedicalDetails: Data.refMedicalDetails,
        refUnderPhysicalCare: Data.refUnderPhysCare,
        refDoctor: Data.refDrName,
        refHospital: Data.refHospital,
        refBackPain: Data.refBackpain,
        refProblem: Data.refProblem,
        refPastHistory: Data.refPastHistory,
        refFamilyHistory: Data.refFamilyHistory,
        refAnythingelse: Data.refAnythingelse,
      };

      profileData = { ...profileData, presentHealth };

      const communication = {
        refCtMobile: Data.refCtMobile,
        refCtEmail: Data.refCtEmail,
        refCtWhatsapp: Data.refCtWhatsapp,
        refUcPreference: Data.refUcPreference,
      };

      profileData = { ...profileData, communication };

      const healthResult = await executeQuery(fetchPresentHealthProblem, []);
      const presentHealthProblem = healthResult.reduce((acc: any, row: any) => {
        acc[row.refHealthId] = row.refHealth;
        return acc;
      }, {});

      profileData = { ...profileData, presentHealthProblem };

      const modeOfCommunicationResult = await executeQuery(
        getCommunicationType,
        []
      );
      const modeOfCommunication = modeOfCommunicationResult.reduce(
        (acc: any, row: any) => {
          acc[row.refCtId] = row.refCtText;
          return acc;
        },
        {}
      );

      profileData = { ...profileData, modeOfCommunication };

      return encrypt(
        {
          success: true,
          message: "profile Data Is Passed Successfully",
          token: token,
          data: profileData,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "error in sending Profile Data",
          token: token,
        },
        true
      );
    }
  }
  public async userProfileUpdateV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const refStId = decodedToken || 65;

    try {
      await client.query("BEGIN");
      for (const section in userData) {
        if (userData.hasOwnProperty(section)) {
          let tableName: string;
          let updatedData, transTypeId, newData, olddata, getUserData;
          let oldData;
          switch (section) {
            case "address":
              tableName = "refUserAddress";

              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];

              userData = { ...userData, olddata };

              transTypeId = 9;
              let refAdAdd1Type: number = 3;
              let refAdAdd2Type: number = 0;

              if (userData.address.addresstype === false) {
                refAdAdd1Type = 1;
                refAdAdd2Type = 2;
              }

              if (userData.olddata.addresstype === false) {
                refAdAdd1Type = 1;
                refAdAdd2Type = 2;
              }

              updatedData = userData.address;
              updatedData = { ...updatedData, refAdAdd1Type, refAdAdd2Type };
              oldData = userData.olddata;
              oldData = { ...oldData, refAdAdd1Type, refAdAdd2Type };

              delete updatedData.addresstype;

              break;

            case "personalData":
              transTypeId = 10;
              tableName = "users";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              function formatDate(isoDate: any) {
                const date = new Date(isoDate);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();

                return `${year}-${month}-${day}`;
              }

              olddata = newData[0];
              olddata.refStDOB = formatDate(olddata.refStDOB);
              userData = { ...userData, olddata };
              userData.personalData.refStDOB = formatDate(
                userData.personalData.refStDOB
              );
              updatedData = userData.personalData;
              oldData = userData.olddata;
              break;

            case "generalhealth":
              transTypeId = 11;
              tableName = "refGeneralHealth";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.generalhealth;
              oldData = userData.olddata;
              break;

            case "presentHealth":
              updatedData = userData.presentHealth;
              const refPerHealthId = JSON.stringify(
                updatedData.refPresentHealth
              );
              transTypeId = 12;
              tableName = "refGeneralHealth";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];

              olddata.refPerHealthId = JSON.stringify(olddata.refPerHealthId);

              userData = { ...userData, olddata };
              updatedData = { ...updatedData, refPerHealthId };
              delete updatedData.refPresentHealth;

              oldData = userData.olddata;
              break;

            case "communication":
              transTypeId = 13;
              tableName = "refUserCommunication";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [refStId]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.communication;
              oldData = userData.olddata;
              break;

            default:
              continue;
          }

          const identifier = { column: "refStId", value: refStId };
          const changes = getChanges(updatedData, oldData);
          console.log("\n\n\n\n\n\nchanges line --------------677", changes);

          const { updateQuery, values } = buildUpdateQuery(
            tableName,
            updatedData,
            identifier
          );

          const userResult = await client.query(updateQuery, values);

          if (!userResult.rowCount) {
            throw new Error("Failed to update the profile data.");
          }

          for (const key in changes) {
            if (changes.hasOwnProperty(key)) {
              const change = changes[key];

              const parasHistory = [
                transTypeId,
                changes[key],
                refStId,
                new Date().toLocaleString(),
                "user",
              ];
              const queryResult = await client.query(
                updateHistoryQuery1,
                parasHistory
              );
              if (!queryResult.rowCount) {
                throw new Error("Failed to update the History.");
              }

              await client.query("COMMIT");
            }
          }
        }
      }

      const tokenData = { id: refStId };
      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "Profile data updated  successfully",
          token: token,
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error in updating the profile data",
      };
      return encrypt(results, true);
    } finally {
      client.release();
    }
  }
}
