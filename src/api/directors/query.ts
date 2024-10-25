export const queryStaffDetails = `SELECT DISTINCT ON (u."refSCustId") * 
FROM public.users u
FULL JOIN public."refUserCommunication" uc
  ON CAST(u."refStId" AS INTEGER) = uc."refStId"
FULL JOIN public."refUserAddress" ad
  ON CAST(u."refStId" AS INTEGER) = ad."refStId"
WHERE u."refUtId" IN (4,8,10); `;

export const getUserStatusLabel = `SELECT * FROM public."refUserType"`;

export const getUserData = ``;

export const getDataForUserManagement = `
SELECT DISTINCT ON (u."refSCustId") *
FROM public.users u
JOIN public."refUserCommunication" uc
  ON CAST(u."refStId" AS INTEGER) = uc."refStId"
JOIN public."refUserAddress" ad
  ON CAST(u."refStId" AS INTEGER) = ad."refStId"
JOIN public."refGeneralHealth" gh
  ON CAST(u."refStId" AS INTEGER) = gh."refStId"
WHERE u."refStId" = $1;`;

export const getUserTransaction = `
SELECT * FROM public."refUserTxnHistory" WHERE "refStId"=$1
ORDER BY "transTime"`;

export const getUserTypeLabel = `SELECT * FROM public."refUserType" WHERE "refUtId" IN (4,7,8,10)`;

export const getCustomerCount = `SELECT COUNT(*) 
FROM public.users
WHERE "refSCustId" LIKE 'UBYS%';`;

export const insertUserQuery = `
  INSERT INTO public.users (
    "refStFName", "refStLName", "refStDOB", 
   "refSCustId","refUtId","refDummy1","refDummy2"
  ) VALUES ($1, $2, $3, $4, $5, $6,$7) 
  RETURNING "refStId", "refSCustId";
`;
export const insertUserDomainQuery = `
  INSERT INTO public."refUsersDomain" (
    "refStId", "refCustId","refUserName", "refCustPassword","refCustHashedPassword"
  ) VALUES ($1, $2, $3, $4,$5)
  RETURNING *;
`;

export const insertUserCommunicationQuery = `
  INSERT INTO public."refUserCommunication" (
    "refStId", "refCtMobile", "refCtEmail"
  ) VALUES ($1, $2, $3)
  RETURNING *;
`;

export const updateHistoryQuery = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId", "transTime", "refStId","refUpdatedBy"
  ) VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

export const updateHistoryQuery1 = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy"
  ) VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

export const fetchFormSubmitedData = `SELECT DISTINCT ON ("refSCustId") *
FROM public.users u
FULL JOIN public."refUserCommunication" uc
  ON CAST(u."refStId" AS INTEGER) = uc."refStId"
FULL JOIN public."refUserAddress" ad
  ON CAST(u."refStId" AS INTEGER) = ad."refStId"
FULL JOIN public."refUserTxnHistory" th
  ON CAST(u."refStId" AS INTEGER) = th."refStId"
WHERE "refUtId" = 2  
  AND "reftherapist" IS NULL
ORDER BY "refSCustId";`;

export const updateUserType = `
 UPDATE public."users"
SET 
  "refUtId" = $2,"reftherapist" =$3
WHERE "refStId" = $1
RETURNING *;
`;

export const updateUserProfile = `UPDATE public."users" SET "refProfilePath"=$1 WHERE "refStId"=$2
RETURNING *;`;

export const getUserProfile = `SELECT "refProfilePath" FROM public.users WHERE "refStId"=$1;`;
