import { executeQuery } from "../../helper/db";
import {
  fetchClientData,
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
      const refStId = 3;
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
}
