import { executeQuery, getClient } from "../../helper/db";
import { getUserData as rawGetUserDataQuery } from "./query";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { PoolClient } from "pg";
import { reLabelText } from "../../helper/label";
import {
  fetchClientData,
  getPresentHealthLabel,
  updateUserType,
  updateUserStatus,
  updateHistoryQuery,
  getStatusLabel,
  getFollowUpLabel,
  getDataForUserManagement,
  getSignUpCount,
  getRegisterCount,
  getUserStatusLabel,
  getStaffRestriction,
  getUserType,
  getUserCount,
  getStaffCount,
  getRecentFormData,
  fetchClientData1,
  updateHistoryQuery1,
  userTempData,
  updateNotification,
} from "./query";
import { encrypt } from "../../helper/encrypt";
import { generateToken, decodeToken } from "../../helper/token";

export class StaffRepository {
  public async staffDashBoardV1(
    userData: any
    // decodedToken: number
  ): Promise<any> {
    try {
      // const refStId = decodedToken;
      const refStId = 1;
      const userType = await executeQuery(getUserType, [refStId]);
      const refUserType = userType[0];
      let refDashBoardData = {};
      const staffRestriction = await executeQuery(getStaffRestriction, [7]);
      const restrictionLabel = staffRestriction.reduce((acc, item, index) => {
        acc[index + 1] = item.columnName; // Use index + 1 for 1-based keys
        return acc;
      }, {});
      refDashBoardData = { ...refDashBoardData, restrictionLabel };
      for (let i = 0; i < staffRestriction.length; i++) {
        const userTypeName = staffRestriction[i].columnName;
        switch (userTypeName) {
          case "users":
            const userTypeCount = await executeQuery(getUserCount, []);
            refDashBoardData = { ...refDashBoardData, userTypeCount };
            break;
          case "registered":
            const registerCount = await executeQuery(getRegisterCount, []);
            refDashBoardData = { ...refDashBoardData, registerCount };
            const registerSampleData = await executeQuery(
              getRecentFormData,
              []
            );
            refDashBoardData = { ...refDashBoardData, registerSampleData };

          case "signedup":
            const signUpCount = await executeQuery(getSignUpCount, []);
            refDashBoardData = { ...refDashBoardData, signUpCount };
          case "feedback":
            console.log("This For Feedback");

            break;
          case "transaction":
            console.log("This for Transaction");
            break;
          case "payroll":
            console.log("This For payRoll");
            break;
          case "staff":
            const staffCount = await executeQuery(getStaffCount, []);
            refDashBoardData = { ...refDashBoardData, staffCount };
            break;
          case "report":
            console.log("this For report");
            break;
          case "blogs":
            console.log("This For Blog");
            break;
          case "notes":
            console.log("This For Notes");
            break;
          case "restrictions":
            console.log("This for therapist user data");
            break;
          case "therapistuserdata":
            const therapistUserDataCount = await executeQuery(
              getRegisterCount,
              []
            );
            refDashBoardData = { ...refDashBoardData, therapistUserDataCount };
            break;
          default:
            console.log("Some Miss Match Restiction Passed");
            break;
        }
      }

      let notificationData = {};

      switch (refUserType.refUtId) {
        case 5: {
          console.log("This Notification For Student");
          break;
        }
        case 7: {
          // Director
          console.log("This Notification For Director");
          break;
        }
        case 8: {
          console.log("This Notification For Finance");
          break;
        }
        case 10: {
          console.log("This Notification For Instructor");
          break;
        }
        case 11: {
          console.log("This Notification For Therapist");
          break;
        }
      }
      refDashBoardData = { ...refDashBoardData, notificationData };

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
  public async staffDashBoardV11(userData: any): Promise<any> {
    try {
      const refStId = userData.refStID;

      const staffRestriction = await executeQuery(getStaffRestriction, []);
      const signUpCount = await executeQuery(getSignUpCount, []);
      const registerCount = await executeQuery(getRegisterCount, []);

      const dashBoardData = {
        signupCount: signUpCount,
        registerCount: registerCount,
      };

      const tokenData = {
        // id: refStId,
        id: 6,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "Front Desk DashBoard Data Passed Successfully",
          token: token,
          data: dashBoardData,
        },
        true
      );
    } catch (error) {
      console.error("Error in userRegisterPageDataV1:", error);
      throw error;
    }
  }
  public async staffStudentApprovalV1(userData: any): Promise<any> {
    try {
      // const refStId = parseInt(userData.refStId, 10);
      const getClientData = await executeQuery(fetchClientData1, [
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
          message: "Form Registered Data Passed Successfully",
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

  public async staffApprovalBtnV1(userData: any): Promise<any> {
    try {
      console.log("userData", userData);

      const studentId = [userData.refStId, userData.nextStatus];
      // const refStId = parseInt(userData.refStId, 10);
      const updateUserTypeResult = await executeQuery(
        updateUserType,
        studentId
      );
      console.log("updateUserTypeResult", updateUserTypeResult);

      const transId = 4,
        transData = "Accept the User as Student",
        refUpdatedBy = "Front Desk";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        new Date().toLocaleString(),
        refUpdatedBy,
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
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
            message: "Error in Approval",
            token: token,
          },
          false
        );
      }

      return encrypt(
        {
          success: true,
          message: "Client is Changed as Student Successfully",
          token: token,
        },
        false
      );
    } catch (error) {
      console.error("Error in userRegisterPageDataV1:", error);
      throw error;
    }
  }
  public async staffRejectionBtnV1(userData: any): Promise<any> {
    try {
      const studentId = [userData.refStId, 9];
      // const refStId = parseInt(userData.refStId, 10);
      const updateUserTypeResult = await executeQuery(
        updateUserType,
        studentId
      );

      const transId = 5,
        transData = userData.comment,
        refUpdatedBy = "Front Desk";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        new Date().toLocaleString(),
        refUpdatedBy,
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      const tokenData = {
        // id: refStId,
        id: 6,
      };
      const token = generateToken(tokenData, true);

      if (!updateUserTypeResult.length && updateHistoryQueryResult) {
        return encrypt(
          {
            success: false,
            message: "Error in Rejection",
            token: token,
          },
          false
        );
      }

      return encrypt(
        {
          success: true,
          message: "User is changed as client",
          token: token,
        },
        false
      );
    } catch (error) {
      console.error("Error in userRegisterPageDataV1:", error);
      throw error;
    }
  }
  public async userSignedUpV1(userData: any): Promise<any> {
    try {
      // const refStId = parseInt(userData.refStId, 10);
      const registeredId = [1, 1];
      const getClientData = await executeQuery(fetchClientData, registeredId);
      const StatusLabel = await executeQuery(getStatusLabel);
      const refStatusLabel = StatusLabel.reduce((acc: any, row: any) => {
        acc[row.refUserStatusId] = row.refStatusType;
        return acc;
      }, {});
      const FollowUpLabel = await executeQuery(getFollowUpLabel);
      const refFollowUpLabel = FollowUpLabel.reduce((acc: any, row: any) => {
        acc[row.refUserFollowUpId] = row.refFollowUpType;
        return acc;
      }, {});

      const Data = {
        refStatusLabel: refStatusLabel,
        refFollowUpLabel: refFollowUpLabel,
      };

      const tokenData = {
        // id: refStId,
        id: 3,
      };

      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "Client SignUp Data Passed Successfully",
          data: getClientData,
          token: token,
          label: Data,
        },
        false
      );
    } catch (error) {
      console.error("Error in Passing Signed Up Data", error);
      throw error;
    }
  }

  public async userFollowUpV1(userData: any): Promise<any> {
    try {
      const studentId = [userData.refStId, 3];
      console.log("userData", userData);

      const userStatus = [
        userData.refStId,
        userData.refStatusId,
        userData.refFollowUpId,
        userData.refComments,
      ];
      const updateUserStatusResult = await executeQuery(
        updateUserStatus,
        userStatus
      );
      const transId = 7,
        transData = "User FollowUp Data Updated",
        refUpdatedBy = "Front Desk";

      const historyData = [
        transId,
        transData,
        userData.refStId,
        new Date().toLocaleString(),
        refUpdatedBy,
      ];

      const updateHistoryQueryResult = await executeQuery(
        updateHistoryQuery,
        historyData
      );

      const tokenData = {
        // id: refStId,
        id: 3,
      };
      const token = generateToken(tokenData, true);

      if (!updateHistoryQueryResult.length && !updateUserStatusResult) {
        return encrypt(
          {
            success: false,
            message: "Error in Update FollowUp Details",
            token: token,
          },
          false
        );
      }

      return encrypt(
        {
          success: true,
          message: "Client FollowUp Data is Updated Successfully",
          token: token,
        },
        false
      );
    } catch (error) {
      console.error("Error in FollowUp Data Updated:", error);
      throw error;
    }
  }
  public async userManagementPageV1(userData: any): Promise<any> {
    try {
      // const refStId = parseInt(userData.refStId);
      const userTypeLabel = await executeQuery(getUserStatusLabel, []);

      const userData = await executeQuery(getDataForUserManagement, []);
      const userTypeMap = new Map(
        userTypeLabel.map((item) => [item.refUtId, item.refUserType])
      );

      // Iterate over the array and replace refUtId with the corresponding label
      userData.forEach((user) => {
        user.refUtIdLabel = userTypeMap.get(user.refUtId) || "Unknown";
      });

      return encrypt(
        {
          success: true,
          message: "User Management Data Is Passed Successfully",
          data: userData,
        },
        false
      );
    } catch (error) {
      console.error("Error in Passing User Management Page Data:", error);
      throw error;
    }
  }
  public async userDataUpdateV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const staffId = decodedToken || 3;
    const id = userData.refStId;
    let tokenData = {
      id: staffId,
    };
    try {
      await client.query("BEGIN");
      for (const section in userData) {
        if (userData.hasOwnProperty(section)) {
          let tableName: string;
          let updatedData, transTypeId, newData, olddata, getUserData, oldData;
          switch (section) {
            case "address":
              tableName = "refUserAddress";
              getUserData = rawGetUserDataQuery.replace(
                "{{tableName}}",
                tableName
              );
              newData = await executeQuery(getUserData, [id]);

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

              newData = await executeQuery(getUserData, [id]);

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
              newData = await executeQuery(getUserData, [id]);

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
              newData = await executeQuery(getUserData, [id]);

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
              newData = await executeQuery(getUserData, [id]);

              olddata = newData[0];
              userData = { ...userData, olddata };
              updatedData = userData.communication;
              oldData = userData.olddata;
              break;

            default:
              continue;
          }
          let temp1, temp2;
          temp1 = updatedData;
          temp2 = oldData;
          if (oldData.refPerHealthId && updatedData.refPerHealthId) {
            (temp1 = updatedData), (temp2 = oldData);
            const getLabel = await executeQuery(getPresentHealthLabel, []);

            const userTypeMap = new Map<number, string>(
              getLabel.map((item) => [item.refHealthId, item.refHealth])
            );

            const parsedArray1: number[] = JSON.parse(temp2.refPerHealthId);
            const parsedArray2: number[] = JSON.parse(temp1.refPerHealthId);

            const labelsOldData = parsedArray1.map(
              (userId: number) => userTypeMap.get(userId) || "Unknown"
            );
            const labelsUpdatedData = parsedArray2.map(
              (userId: number) => userTypeMap.get(userId) || "Unknown"
            );

            temp2.refPerHealthId = JSON.stringify(labelsOldData);
            temp1.refPerHealthId = JSON.stringify(labelsUpdatedData);
          }

          const changes = getChanges(temp1, temp2);
          console.log("changes", changes);

          for (const key in changes) {
            if (changes.hasOwnProperty(key)) {
              const tempChange = {
                data: changes[key],
                label: reLabelText(key),
              };
              const tempData = {
                [key]: changes[key].newValue,
              };

              const parasHistory = [
                16,
                tempChange,
                id,
                new Date().toLocaleString(),
                "user",
              ];
              const queryResult = await client.query(
                updateHistoryQuery1,
                parasHistory
              );

              if (!queryResult) {
                throw new Error("Failed to update the History.");
              }

              const params = [
                id,
                transTypeId,
                tempChange,
                tempData,
                tableName,
                new Date().toLocaleString(),
                queryResult.rows[0].transId,
              ];

              const userResult = await client.query(userTempData, params);

              if (!userResult) {
                throw new Error(
                  "Failed to update the profile data from Front Desk"
                );
              }

              const paramsNotification = [queryResult.rows[0].transId, false];
              const notificationResult = await client.query(
                updateNotification,
                paramsNotification
              );
              if (!notificationResult.rowCount) {
                throw new Error("Failed to update The Notification Table.");
              }
            }
          }
          await client.query("COMMIT");
        }
      }
      const token = generateToken(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "user Profile Data is Send for Approval To Update",
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
