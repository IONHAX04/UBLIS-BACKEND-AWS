import * as Hapi from "@hapi/hapi";

import IRoute from "../helper/routes";
import validate from "./validate";
import {
  UserController,
  UserProfileController,
  FrontDesk,
  Director,
  userDashBoard,
} from "./controller";
import { Logger } from "winston";
import { decodeToken, validateToken } from "../helper/token";

export class UserRouters implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new UserController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/users/login",
          config: {
            handler: controller.userLogin,
            description: "Login Checking",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/users/signup",
          config: {
            handler: controller.userSignUp,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/users/validateUserName",
          config: {
            handler: controller.validateUserName,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/validatetoken",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.validateUserV1,
            // validate: validate.userSignUp,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/validateTokenData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.validateUserTokenV1,
            description: "Signup Checking",
            tags: ["api", "Users", "SignUp"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}

export class UserProfile implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new UserProfileController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/profile/address",
          config: {
            handler: controller.userAddress,
            description: "Store Address Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/personalData",
          config: {
            handler: controller.personalData,
            description: "Store Personal Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/generalHealth",
          config: {
            handler: controller.userGeneralHealth,
            description: "Store General Health",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/profile/RegisterData",
          config: {
            pre: [{ method: validateToken, assign: "token" }], // Use the validateToken function here
            handler: controller.userRegisterData,
            description: "Store Register Form Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },

        {
          method: "GET",
          path: "/api/v1/profile/passRegisterData",
          config: {
            pre: [{ method: validateToken, assign: "token" }], // Use the validateToken function here
            handler: controller.userRegisterPageData,
            description: "Passing the register Data to the Register Page",
            tags: ["api", "Users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}

export class StaffRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new FrontDesk();
      server.route([
        {
          method: "GET",
          path: "/api/v1/staff/dashBoard",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffDashBoard,
            description: "Front Office Dashboard",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/staff/studentApproval",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffStudentApproval,
            description: "Staff Student Approval Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/Approvalbtn",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffApprovalBtn,
            description: "Staff Student Approval Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/rejectionbtn",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.staffRejectionBtn,
            description: "Staff Student Rejection Request",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/staff/userSignedUp",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userSignedUp,
            description: "Staff Student Approval Request",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/userFollowUp",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userFollowUp,
            description: "Signup User FollowUp Details",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/staff/userManagementPage",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userManagementPage,
            description: "Signup User FollowUp Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/staff/userDataUpdate",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataUpdate,
            description: "Staff To Update Student Details",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
export class DirectorRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new Director();
      server.route([
        {
          method: "GET",
          path: "/api/v1/director/staff",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.directorStaffPg,
            description: "director Page Staff Module",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userData",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userData,
            description: "director Page Staff Module",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/therapist/approvalButton",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.approvalButton,
            description: "therapist Student Approval Button",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/therapist/approvalData",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.therapistApprovalData,
            description: "therapist Student Approval Data ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/addEmployee",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addEmployee,
            description: "Add New Staff Or Employee Documents",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/director/userTypeLabel",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userTypeLabel,
            description: "Add New Staff Or Employee Documents",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/addEmployeeDocument",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addEmployeeData,
            description: "Add New Staff Or Employee Documents",
            tags: ["api", "Users"],
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
        {
          method: "GET",
          path: "/api/v1/director/userAuditList",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userAuditList,
            description: "sending user Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userUpdateAuditList",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userUpdateAuditList,
            description: "sending user Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userUpdateAuditListRead",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userUpdateAuditListRead,
            description: "sending user Details to user Audit page ",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userDataListApproval",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataListApproval,
            description: "Staff To Update Student Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userDataUpdateApprovalBtn",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataUpdateApprovalBtn,
            description: "Staff To Update Student Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/director/userDataUpdateRejectBtn",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userDataUpdateRejectBtn,
            description: "Staff To Update Student Details",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}

export class UserPageRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const UserPage = new userDashBoard();
      server.route([
        {
          method: "GET",
          path: "/api/v1/user/dashBoard",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userDashBoardData,
            description: "User Dash Board Tail Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/user/profileData",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userProfileData,
            description: "User Profile Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/user/updateProfile",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: UserPage.userProfileUpdate,
            description: "User Profile Update Process",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}

// export class SignUp implements IRoute{

// }
