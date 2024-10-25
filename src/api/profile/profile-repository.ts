import { executeQuery, getClient } from "../../helper/db";
import {
  insertProfileAddressQuery,
  insertProfileGeneralHealth,
  insertProfilePersonalData,
  fetchProfileData,
  fetchPreferableTiming,
  fetchPresentHealthProblem,
  insertCommunicationData,
  updateHistoryQuery,
  fetchBranchList,
} from "./query";
import { encrypt } from "../../helper/encrypt";
import { generateToken, generateToken1 } from "../../helper/token";
import { PoolClient } from "pg"; // Assuming you're using pg library for PostgreSQL

export class ProfileRepository {
  // STORING ADDRESS IN DB
  public async userAddressV1(userData: any): Promise<any> {
    let refAdAdd1Type: number = 3;
    let refAdAdd2Type: number = 0;

    if (userData.address.addresstype == false) {
      refAdAdd1Type = 1;
      refAdAdd2Type = 2;
    }

    const params = [
      userData.refStId,
      refAdAdd1Type,
      userData.address.refAdAdd1,
      userData.address.refAdArea1,
      userData.address.refAdCity1,
      userData.address.refAdState1,
      userData.address.refAdPincode1,
      refAdAdd2Type,
      userData.address.refAdAdd2,
      userData.address.refAdArea2,
      userData.address.refAdCity2,
      userData.address.refAdState2,
      userData.address.refAdPincode2,
    ];

    const userResult = await executeQuery(insertProfileAddressQuery, params);
    const results = {
      success: true,
      message: "Address Stored Successfully",
    };
    return encrypt(results, true);
  }

  public async userPersonalDataV1(userData: any): Promise<any> {
    const params = [
      userData.personalData.ref_su_gender,
      userData.personalData.ref_su_qulify,
      userData.personalData.ref_su_occu,
      userData.personalData.ref_su_guardian,
      userData.refStId,
    ];
    const userResult = await executeQuery(insertProfilePersonalData, params);

    const results = {
      message: "Personal Data Stored Successfully",
      updatedData: userResult,
    };
    return encrypt(results, true);
  }

  public async userGeneralHealthV1(userData: any): Promise<any> {
    const refPresentHealthJson = JSON.stringify(
      userData.generalhealth.refPresentHealth
    );

    const params = [
      userData.refStId,
      userData.generalhealth.refHeight,
      userData.generalhealth.refWeight,
      userData.generalhealth.refBlood,
      userData.generalhealth.refBMI,
      userData.generalhealth.refBP,
      userData.generalhealth.refRecentInjuries,
      userData.generalhealth.refRecentInjuriesReason,
      userData.generalhealth.refRecentFractures,
      userData.generalhealth.refRecentFracturesReason,
      userData.generalhealth.refOthers,
      userData.generalhealth.refElse,
      userData.generalhealth.refOtherActivities,
      refPresentHealthJson,
      userData.generalhealth.refMedicalDetails,
      userData.generalhealth.refUnderPhysicalCare,
      userData.generalhealth.refDoctor,
      userData.generalhealth.refHospital,
      userData.generalhealth.refBackPain,
      userData.generalhealth.refProblem,
      userData.generalhealth.refPastHistory,
      userData.generalhealth.refFamilyHistory,
      userData.generalhealth.refAnythingelse,
    ];

    const userResult = await executeQuery(insertProfileGeneralHealth, params);
    const results = {
      success: true,
      message: "Health Data Stored Successfully",
    };
    return encrypt(results, true);
  }

  public async userRegisterDataV1(
    userData: any,
    decodedToken: number
  ): Promise<any> {
    const client: PoolClient = await getClient(); // Get the database client
    try {
      // Start the transaction
      await client.query("BEGIN");

      userData.refStId = decodedToken;
      const refUtId = 2;

      // Step 1: Update personal data in users table
      const paramsProfile = [
        userData.personalData.ref_su_gender, //1
        userData.personalData.ref_su_qulify, //2
        userData.personalData.ref_su_occu, //3
        userData.personalData.ref_su_guardian, //4
        userData.personalData.ref_su_timing, //5
        refUtId, //6
        userData.personalData.ref_su_branch, //7
        userData.personalData.ref_su_fname, //8
        userData.personalData.ref_su_lname, //9
        userData.personalData.ref_su_dob, //10
        userData.personalData.ref_su_age, //11
        userData.refStId, //12
      ];

      const userResult1 = await client.query(
        insertProfilePersonalData,
        paramsProfile
      );

      if (!userResult1.rowCount) {
        throw new Error("Failed to update personal data in the users table.");
      }

      //step2: Insert Communication Data into the refCommunication table
      const parasCommunication = [
        userData.refStId, //1
        userData.personalData.ref_su_Whatsapp, //2
        userData.personalData.ref_su_phoneno, //3
        userData.personalData.ref_su_mailid, //4
      ];

      const userResult2 = await client.query(
        insertCommunicationData,
        parasCommunication
      );

      if (!userResult2.rowCount) {
        console.log();

        throw new Error(
          "Failed to insert Communication  data into the refUserCommunication table."
        );
      }

      let refAdAdd1Type: number = 1;
      let refAdAdd2Type: number = 2;
      if (userData.address.addresstype === true) {
        refAdAdd1Type = 3;
        refAdAdd2Type = 0;
        userData.address.refAdAdd2 = "";
        userData.address.refAdArea2 = "";
        userData.address.refAdCity2 = "";
        userData.address.refAdState2 = "";
        userData.address.refAdPincode2;
      }

      const paramsAddress = [
        userData.refStId,
        refAdAdd1Type,
        userData.address.refAdAdd1,
        userData.address.refAdArea1,
        userData.address.refAdCity1,
        userData.address.refAdState1,
        userData.address.refAdPincode1,
        refAdAdd2Type,
        userData.address.refAdAdd2,
        userData.address.refAdArea2,
        userData.address.refAdCity2,
        userData.address.refAdState2,
        userData.address.refAdPincode2,
      ];
      const userResult3 = await client.query(
        insertProfileAddressQuery,
        paramsAddress
      );

      if (!userResult3.rowCount) {
        throw new Error(
          "Failed to insert address data into the refUserAddress table."
        );
      }

      // Step 3: Insert health-related data into the refGeneralHealth table
      const refPresentHealthJson = JSON.stringify(
        userData.generalhealth.refPresentHealth
      );
      const paramsHealth = [
        userData.refStId,
        userData.generalhealth.refHeight,
        userData.generalhealth.refWeight,
        userData.generalhealth.refBlood,
        userData.generalhealth.refBMI,
        userData.generalhealth.refBP,
        userData.generalhealth.refRecentInjuries,
        userData.generalhealth.refRecentInjuriesReason,
        userData.generalhealth.refRecentFractures,
        userData.generalhealth.refRecentFracturesReason,
        userData.generalhealth.refOthers,
        userData.generalhealth.refElse,
        userData.generalhealth.refOtherActivities,
        refPresentHealthJson,
        userData.generalhealth.refMedicalDetails,
        userData.generalhealth.refUnderPhysicalCare,
        userData.generalhealth.refDoctor,
        userData.generalhealth.refHospital,
        userData.generalhealth.refBackPain,
        userData.generalhealth.refProblem,
        userData.generalhealth.refPastHistory,
        userData.generalhealth.refFamilyHistory,
        userData.generalhealth.refAnythingelse,
      ];
      const userResult4 = await client.query(
        insertProfileGeneralHealth,
        paramsHealth
      );
      if (!userResult4.rowCount) {
        throw new Error(
          "Failed to insert health data into the refGeneralHealth table."
        );
      }
      const transTypeId = 3,
        transData = "Registered Form Data",
        refUpdatedBy = "user";
      const parasHistory = [
        transTypeId,
        transData,
        userData.refStId,
        new Date().toLocaleString(),
        refUpdatedBy,
      ];

      const userResult5 = await client.query(updateHistoryQuery, parasHistory);

      if (!userResult5.rowCount) {
        throw new Error("Failed to insert The History In refUserTxnHistory.");
      }

      // Commit the transaction if all queries succeeded
      await client.query("COMMIT");

      const token = { id: userData.refStId };
      const results = {
        success: true,
        message: "All data stored successfully",
        token: generateToken1(token, true),
      };
      return encrypt(results, true);
    } catch (error) {
      console.log("error", error);
      // Rollback the transaction in case of any error
      await client.query("ROLLBACK");

      const results = {
        success: false,
        message: error || "Error occurred while processing.",
      };
      return encrypt(results, false);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  public async userRegisterPageDataV1(userData: any): Promise<any> {
    try {
      const refStId = parseInt(userData.refStId, 10);
      if (isNaN(refStId)) {
        throw new Error("Invalid refStId. Must be a number.");
      }

      const params = [refStId];
      const profileResult = await executeQuery(fetchProfileData, params);
      console.log("profileResult", profileResult);

      if (!profileResult.length) {
        throw new Error("Profile data not found for refStId: " + refStId);
      }

      function formatDate(isoDate: any) {
        const date = new Date(isoDate); // Create a new Date object
        const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
      }

      const profileData = {
        fname: profileResult[0].refStFName,
        lname: profileResult[0].refStLName,
        dob: formatDate(profileResult[0].refStDOB),
        username: profileResult[0].refUserName,
        email: profileResult[0].refCtEmail,
        phone: profileResult[0].refCtMobile,
        age: profileResult[0].refStAge,
      };
      console.log("profileData", profileData);

      const timingResult = await executeQuery(fetchPreferableTiming, []);
      const preferableTiming = timingResult.map((row: any, index: number) => {
        return {
          [index +
          1]: `${row.refTime} ${row.refTimeMembers} ${row.refTimeMode} ${row.refTimeDays}`,
        };
      });

      const healthResult = await executeQuery(fetchPresentHealthProblem, []);
      const presentHealthProblem = healthResult.reduce((acc: any, row: any) => {
        acc[row.refHealthId] = row.refHealth;
        return acc;
      }, {});

      const branchResult = await executeQuery(fetchBranchList, []);
      const branchList = branchResult.reduce((acc: any, row: any) => {
        acc[row.refbranchId] = row.refBranchName;
        return acc;
      }, {});

      const registerData = {
        ProfileData: profileData,
        PreferableTiming: preferableTiming,
        presentHealthProblem: presentHealthProblem,
        branchList: branchList,
      };

      const tokenData = {
        id: refStId,
      };

      const token = generateToken1(tokenData, true);

      return encrypt(
        {
          success: true,
          message: "userRegisterPageData",
          data: registerData,
          token: token,
        },
        true
      );
    } catch (error) {
      console.error("Error in userRegisterPageDataV1:", error);
      throw error;
    }
  }
}
