import { executeQuery, getClient } from "../../helper/db";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { viewFile, deleteFile, storeFile } from "../../helper/storage";
import path from "path";
import { PoolClient } from "pg";
import { sendEmail } from "../../helper/mail";
import { staffDetailSend, updateDataApproval } from "../../helper/mailcontent";

import {
  queryStaffDetails,
  getUserStatusLabel,
  getDataForUserManagement,
  getUserTransaction,
  getUserTypeLabel,
  getCustomerCount,
  insertUserQuery,
  insertUserDomainQuery,
  insertUserCommunicationQuery,
  updateHistoryQuery,
  fetchFormSubmitedData,
  updateHistoryQuery1,
  updateUserType,
  updateUserProfile,
  getUserProfile,
  getUpDateList,
  userUpdateAuditData,
  userAuditDataRead,
  getTempData,
  updateTempData,
  userUpdateApprovalList,
  getMailId,
} from "./query";
import { encrypt } from "../../helper/encrypt";
import { generateToken, decodeToken } from "../../helper/token";

export class DirectorRepository {
  public async directorStaffPgV1(userData: any): Promise<any> {
    try {
      const userTypeLabel = await executeQuery(getUserStatusLabel, []);
      const StaffData = await executeQuery(queryStaffDetails, []);
      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      StaffData.forEach((user) => {
        user.refUserTypeName = userTypeMap.get(user.refUtId) || "Unknown";
      });

      const token = {
        //  id: userData.refStId
        id: 26,
      };
      const results = {
        success: true,
        message: "staff Data Is Passed Successfully",
        token: generateToken(token, true),
        data: StaffData,
      };
      return encrypt(results, false);
    } catch (error) {
      console.log("error", error);
    }
  }
  public async userDataV1(userData: any, decodedToken: number): Promise<any> {
    // const staffId = decodedToken;
    const Id = userData.refStId;
    try {
      const userTypeLabel = await executeQuery(getUserStatusLabel, []);

      const userData = await executeQuery(getDataForUserManagement, [Id]);
      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      userData.forEach((user) => {
        user.refUtIdLabel = userTypeMap.get(user.refUtId) || "Unknown";
      });

      const userTransaction = await executeQuery(getUserTransaction, [Id]);
      const data = {
        UserData: userData,
        userTransaction: userTransaction,
      };

      return data;
    } catch (error) {}
  }
  public async therapistApprovalDataV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    // const staffId = decodedToken;
    // const Id = userData.refStId;
    try {
      // const refStId = parseInt(userData.refStId, 10);
      const getClientData = await executeQuery(fetchFormSubmitedData, [
        // registeredId,
        // transactionTypes,
      ]);

      const userTypeLabel = await executeQuery(getUserStatusLabel, []);

      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      // Iterate over the array and replace refUtId with the corresponding label
      getClientData.forEach((user) => {
        user.refUtIdLabel = userTypeMap.get(user.refUtId) || "Unknown";
      });

      const tokenData = {
        // id: refStId,
        id: 6,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "therapist Approval Data is Passed Successfully",
          data: getClientData,
          token: token,
        },
        false
      );
    } catch (error) {
      console.error("Error in userRegisterPageDataV1:", error);
      throw error;
    }
  }
  public async approvalButtonV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    // const staffId = decodedToken;
    const Id = userData.refStId;
    try {
      const studentId = [userData.refStId, 3, userData.isTherapy];
      // const refStId = parseInt(userData.refStId, 10);
      const updateUserTypeResult = await executeQuery(
        updateUserType,
        studentId
      );

      const transId = 4,
        transData = "Therapist Submit The response Successfully",
        refUpdatedBy = "Therapist";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        new Date().toLocaleString(),
        refUpdatedBy,
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery1,
        historyData
      );

      const tokenData = {
        // id: refStId,
        id: 6,
      };
      const token = generateToken(tokenData, true);

      if (!updateUserTypeResult.length && !updateHistoryQueryResult.length) {
        return encrypt(
          {
            success: false,
            message: "Error in Therapist Approval",
            token: token,
          },
          false
        );
      }

      return encrypt(
        {
          success: true,
          message: "Client is Approved By Therapist",
          token: token,
        },
        false
      );
    } catch (error) {
      console.error("Error in Therapist Approval Button:", error);
      throw error;
    }
  }
  public async userTypeLabelV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    // const staffId = decodedToken;
    // const Id = userData.refStId;
    try {
      const label = await executeQuery(getUserTypeLabel, []);

      const tokenData = {
        // id: refStId,
        id: 3,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "user Validate Token",
          token: token,
          userTypeLabel: label,
        },
        false
      );
    } catch (error) {
      const tokenData = {
        // id: refStId,
        id: 3,
      };

      const token = generateToken(tokenData, true);
      const results = {
        success: false,
        message: "Error in Passing Labels.",
      };
      return encrypt(results, false);
    }
  }
  public async addEmployeeV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    try {
      const userCountResult = await executeQuery(getCustomerCount);
      const userCount = parseInt(userCountResult[0].count, 10);

      let newCustomerId = `UBYS${(10000 + userCount + 1).toString()}`;

      const params = [
        userData.refFName,
        userData.refLName,
        userData.refDob,
        newCustomerId,
        userData.refType,
        userData.refPanCard,
        userData.refAadharCard,
      ];

      const userResult = await executeQuery(insertUserQuery, params);

      function formatDate(isoDate: any) {
        const date = new Date(isoDate); // Create a new Date object
        const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month (0-based) and pad with zero
        const year = date.getFullYear(); // Get the full year

        return `${year}`; // Return formatted date
      }

      const newUser = userResult[0];

      const dobYear = formatDate(userData.refDob);

      const password = `${userData.refFName.toUpperCase()}$${dobYear}`;

      const hashedPassword = await bcrypt.hash(password, 10);

      const domainParams = [
        newUser.refStId,
        newUser.refSCustId,
        newUser.refSCustId,
        password,
        hashedPassword,
      ];

      const domainResult = await executeQuery(
        insertUserDomainQuery,
        domainParams
      );
      const communicationParams = [
        newUser.refStId,
        userData.refPhone,
        userData.refEmail,
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
        const main = async () => {
          const mailOptions = {
            to: userData.refEmail, // Replace with the recipient's email
            subject: "Director Add U As An Employee In Ublis Yoga", // Subject of the email
            html: staffDetailSend(newUser.refSCustId, password),
          };

          // Call the sendEmail function
          try {
            await sendEmail(mailOptions);
            console.log("Email sent successfully!");
          } catch (error) {
            console.error("Failed to send email:", error);
          }
        };

        main().catch(console.error);

        const history = [
          1,
          new Date().toLocaleString(),
          newUser.refStId,
          "Director",
        ];
        const updateHistory = await executeQuery(updateHistoryQuery, history);

        if (updateHistory && updateHistory.length > 0) {
          const tokenData = { id: 30 };
          const encryptedResponse = encrypt(
            {
              success: true,
              message: "New Employee Data Is Stored Successfully",
              token: generateToken(tokenData, true),
            },
            false
          );
          return encryptedResponse;
        } else {
          return encrypt(
            { success: false, message: "Failed to update history" },
            true
          );
        }
      } else {
        return encrypt({ success: false, message: "Signup failed" }, true);
      }
    } catch (error) {
      console.error("Error in Storing Data:", error);
      return encrypt(
        { success: false, message: "An error occurred while storing data" },
        true
      );
    }
  }

  public async addEmployeeDataV1(
    userData: any,
    decodedToken: any
  ): Promise<any> {
    const refStId = userData.decodedToken;
    const tokenData = {
      id: refStId,
    };
    const token = generateToken(tokenData, true);
    try {
      const params = [userData.filePath, refStId];
      const getProfileUrl = await executeQuery(getUserProfile, [refStId]); // Get old file path from DB

      // Remove the old file if a profile URL exists
      if (getProfileUrl.length > 0 && getProfileUrl[0].refProfilePath) {
        const oldFilePath = getProfileUrl[0].refProfilePath;
        try {
          await deleteFile(oldFilePath);
        } catch (err) {
          return encrypt(
            {
              success: false,
              message: "Failed to Change or Upload the Profile Image",
              token: token,
            },
            true
          );
        }
      }

      // Store the new file as usual
      const profileUrl = await executeQuery(updateUserProfile, params);
      let profileFile;

      if (profileUrl.length > 0) {
        const profileFilePath = userData.filePath; // New file path
        try {
          const fileBuffer = await viewFile(profileFilePath);
          const fileBase64 = fileBuffer.toString("base64"); // Convert file to base64 for response
          profileFile = {
            filename: path.basename(profileFilePath),
            content: fileBase64,
            contentType: "image/jpeg", // Assuming JPEG, modify if necessary
          };
        } catch (err) {
          console.error("Error retrieving profile file:");
          profileFile = null;
        }
      }

      return encrypt(
        {
          success: true,
          message: "File Stored Successfully",
          token: token,
          filePath: profileFile || "No profile file available",
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Storing The Staff Documents",
          token: token,
        },
        true
      );
    }
  }
  public async userAuditListV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const staffId = decodedToken || 1;
    let token = {
      id: staffId,
    };

    function formatDate(isoDate: any) {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    }
    try {
      const getList = await executeQuery(getUpDateList, []);
      for (let i = 0; i < getList.length; i++) {
        getList[i].refDate = formatDate(getList[i].refDate);
      }

      return encrypt(
        {
          success: true,
          message: "User Update Audit list Data is Send Successfully",
          token: token,
          data: getList,
        },
        false
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in User Update Audit list Data Sending",
          token: token,
        },
        false
      );
    }
  }
  public async userUpdateAuditListV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const staffId = decodedToken || 1;
    const id = userData.refStId;
    let token = {
      id: staffId,
    };

    try {
      const getList = await executeQuery(userUpdateAuditData, [id]);
      return encrypt(
        {
          success: true,
          message: "User Update Audit Page Data is Send Successfully",
          token: token,
          data: getList,
        },
        false
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in User Update Audit Data Sending",
          token: token,
        },
        false
      );
    }
  }
  public async userDataListApprovalV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const staffId = decodedToken || 1;
    const id = userData.refStId;
    let token = {
      id: staffId,
    };
    try {
      const getList = await executeQuery(userUpdateApprovalList, [id]);

      // for (let i = 0; i < getList.length; i++) {
      //   if (getList && getList[i].refChanges) {
      //     const refChanges = getList[i].refChanges;

      //     const transformedRefChanges: {
      //       [key: number]: { oldValue: string; newValue: string };
      //     } = {};

      //     Object.keys(refChanges).forEach((key, index) => {
      //       transformedRefChanges[index] = {
      //         oldValue: refChanges[key].oldValue,
      //         newValue: refChanges[key].newValue,
      //       };
      //     });

      //     getList[i].refChanges = transformedRefChanges;
      //   }
      // }

      console.log(getList);

      return encrypt(
        {
          success: true,
          message: "post User Update Approval List",
          token: token,
          data: getList,
        },
        false
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Sending User Approval List",
          token: token,
        },
        false
      );
    }
  }
  public async userUpdateAuditListReadV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const staffId = decodedToken || 1;
    let token = {
      id: 3,
    };
    try {
      for (let i = 0; i < userData.transId.length; i++) {
        const getList = await executeQuery(userAuditDataRead, [
          true,
          staffId,
          userData.transId[i],
        ]);
        if (!getList) {
          console.log(
            "the mark as read for notification is failed to update for",
            userData.transId[i]
          );
        }
      }

      return encrypt(
        {
          success: true,
          message: "User Audit Notification Is Marked as Read Successfully",
          token: token,
        },
        false
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in updating the notification as read",
          token: token,
        },
        false
      );
    }
  }
  public async userDataUpdateApprovalBtnV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const staffId = decodedToken || 1;
    const id = userData.refStId;
    const userAppId = userData.userAppId;
    let tokenData = {
      id: staffId,
    };
    const token = generateToken(tokenData, true);
    try {
      let mailId = await executeQuery(getMailId, [id]);
      let changeData = {};
      mailId = mailId[0].refCtEmail;
      for (let i = 0; i < userAppId.length; i++) {
        const tempData = await executeQuery(getTempData, [userAppId[i]]);
        const transTypeId = tempData[0].transTypeId;
        await client.query("BEGIN");
        for (const section in userData) {
          if (userData.hasOwnProperty(section)) {
            const tableName: string = tempData[0].refTable;

            const updatedData = tempData[0].refData;

            const changes = tempData[0].refChanges;

            const identifier = { column: "refStId", value: id };

            const { updateQuery, values } = buildUpdateQuery(
              tableName,
              updatedData,
              identifier
            );

            const userResult = await client.query(updateQuery, values);

            if (!userResult.rowCount) {
              throw new Error(
                "Failed to update the profile data from Front Desk"
              );
            }

            const userResult1 = await client.query(updateTempData, [
              "approve",
              userAppId[i],
            ]);

            if (!userResult1.rowCount) {
              throw new Error("Failed to Delete the Tem Data");
            }

            for (const key in changes) {
              if (changes.hasOwnProperty(key)) {
                const parasHistory = [
                  transTypeId,
                  changes[key],
                  id,
                  new Date().toLocaleString(),
                  "Front Office",
                ];

                const queryResult = await client.query(
                  updateHistoryQuery1,
                  parasHistory
                );

                const { data, label } = changes[key];
                const Data = {
                  oldValue: data.oldValue,
                  newValue: data.newValue,
                  label: label,
                };

                changeData = { ...changeData, Data };

                if (!queryResult) {
                  throw new Error("Failed to update the History.");
                }

                const getList = await client.query(userAuditDataRead, [
                  true,
                  staffId,
                  tempData[0].refTransId,
                ]);

                if (!getList) {
                  throw new Error("Failed to update Audit Page.");
                }
                await client.query("COMMIT");
              }
            }
          }
        }
      }

      const main = async () => {
        const tableRows = Object.values(changeData)
          .map(
            (data: any) => `
            <tr>
              <td>${data.label}</td>
              <td>${data.oldValue}</td>
              <td>${data.newValue}</td>
            </tr>`
          )
          .join("");
        const mailOptions = {
          to: userData.refEmail, // Replace with the recipient's email
          subject: "Director Add U As An Employee In Ublis Yoga", // Subject of the email
          html: updateDataApproval(tableRows),
        };

        // Call the sendEmail function
        try {
          await sendEmail(mailOptions);
          console.log("Email sent successfully!");
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      };

      main().catch(console.error);

      return encrypt(
        {
          success: true,
          message: "user Profile Data Update is Approved",
          token: token,
        },
        false
      );
    } catch (error) {
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error in updating the profile data",
        token: token,
      };
      return encrypt(results, false);
    } finally {
      client.release();
    }
  }

  public async userDataUpdateRejectBtnV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const staffId = decodedToken || 1;
    const id = userData.refStId;
    const userAppId = userData.userAppId;
    let tokenData = {
      id: staffId,
    };
    const token = generateToken(tokenData, true);
    try {
      for (let i = 0; i < userAppId.length; i++) {
        const tempData = await executeQuery(getTempData, [userAppId[i]]);
        console.log("tempData", tempData);
        const transTypeId = 17;

        await client.query("BEGIN");
        for (const section in userData) {
          if (userData.hasOwnProperty(section)) {
            const tableName: string = tempData[0].refTable;
            const updatedData = tempData[0].refData;
            const changes = tempData[0].refChanges;
            const identifier = { column: "refStId", value: id };

            const userResult1 = await client.query(updateTempData, [
              "reject",
              userAppId[i],
            ]);

            if (!userResult1.rowCount) {
              throw new Error("Failed to Reject the Tem Data");
            }

            for (const key in changes) {
              if (changes.hasOwnProperty(key)) {
                const parasHistory = [
                  transTypeId,
                  changes[key],
                  id,
                  new Date().toLocaleString(),
                  "Front Office",
                ];

                const queryResult = await client.query(
                  updateHistoryQuery1,
                  parasHistory
                );

                if (!queryResult) {
                  throw new Error("Failed to update the History.");
                }

                const transId = queryResult.rows[0].transId;

                const getList = await client.query(userAuditDataRead, [
                  true,
                  staffId,
                  tempData[0].refTransId,
                ]);

                if (!getList) {
                  throw new Error("Failed to update Audit Page.");
                }
                await client.query("COMMIT");
              }
            }
          }
        }
      }

      return encrypt(
        {
          success: true,
          message: "user update Profile Data is Rejected ",
          token: token,
        },
        false
      );
    } catch (error) {
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: "Error in Rejecting the profile data",
        token: token,
      };
      return encrypt(results, false);
    } finally {
      client.release();
    }
  }
}
