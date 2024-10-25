export const checkQuery = `
  SELECT * FROM public."refUsersDomain" 
  WHERE "refUserName" = $1;
`;

export const getCustomerCount = `SELECT COUNT(*) FROM public.users`;

export const insertUserQuery = `
  INSERT INTO public.users (
    "refStFName", "refStLName", "refStDOB", "refStAge", 
   "refSCustId","refUtId"
  ) VALUES ($1, $2, $3, $4, $5, $6) 
  RETURNING "refStId", "refSCustId";
`;

export const insertUserDomainQuery = `
  INSERT INTO public."refUsersDomain" (
    "refStId", "refCustId","refUserName", "refCustPassword", 
    "refCustHashedPassword"
  ) VALUES ($1, $2, $3, $4, $5)
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

export const selectUserQuery = `
  SELECT * FROM public."refUsersDomain" 
  WHERE "refCustId" = $1;
`;

export const selectUserByEmailQuery = `
  SELECT u."refStId", u."refSCustId", u."refStFName", u."refStLName", u."refSUserStatus", 
         ud."refCustPrimEmail", ud."refCustHashedPassword"
  FROM public.users u
  JOIN public."refUsersDomain" ud
    ON u."refStId" = ud."refStId"
  WHERE ud."refCustPrimEmail" = $1;
`;

export const selectUserByUsername =
  'SELECT * FROM public."refUsersDomain" WHERE "refUserName" = $1;';

export const selectUserData = `SELECT u."refUtId",u."refStFName",u."refStLName",ud."refUserName",u."refProfilePath"
FROM public."users" u
JOIN
	public."refUsersDomain" ud
ON u."refStId" = ud."refStId"
WHERE u."refStId" = $1;`;

export const getUserType = 'SELECT "refUtId" FROM  users WHERE "refStId"=$1;';

export const getSingInCount = `SELECT 
  CASE 
    WHEN COUNT(*) = 0 
    THEN true 
    WHEN COUNT(*) = 1 
      AND TO_CHAR(MAX(TO_TIMESTAMP("transTime", 'DD/MM/YYYY, HH12:MI:SS AM')), 'DD/MM/YYYY') = TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY') 
      AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(TO_TIMESTAMP("transTime", 'DD/MM/YYYY, HH12:MI:SS AM')))) <= 50
    THEN true
    ELSE false 
  END as result
FROM public."refUserTxnHistory"
WHERE "refStId" = $1 AND "transTypeId" = 2;`;

export const getFollowUpCount = `SELECT CASE 
    WHEN EXISTS (
        SELECT 1 
        FROM public."refuserstatus" 
        WHERE "refFollowUpId" = 6 
          AND "refStId" = $1
    ) 
    THEN false 
    ELSE true 
END AS "status";

`;

export const getRegisterResult = `
SELECT CASE 
    WHEN "refUtId" = 1 THEN true 
    ELSE false 
END AS "status"
FROM public.users
WHERE "refStId" = $1;
`;

export const getRestriction = `SELECT "columnName" FROM public."refRestrictions" WHERE "refUtId"=$1;`;

export const getProfileData = `SELECT * FROM public.users u 
FULL JOIN public."refUserCommunication" uc
  ON CAST(u."refStId" AS INTEGER) = uc."refStId"
FULL JOIN public."refUserAddress" ad
  ON CAST(u."refStId" AS INTEGER) = ad."refStId"
FULL JOIN public."refGeneralHealth" gh
  ON CAST(u."refStId" AS INTEGER) = gh."refStId"
FULL JOIN public."refUsersDomain" ud
  ON CAST(u."refStId" AS INTEGER) = ud."refStId"
 WHERE u."refStId"=$1
`;

export const fetchPresentHealthProblem = `
  SELECT "refHealthId", "refHealth"
  FROM public."refHealthIssues";
`;

export const getCommunicationType = `
  SELECT "refCtId", INITCAP("refCtText") AS "refCtText"
FROM public."refCommType";
`;

export const updateProfileAddressQuery = `
  UPDATE public."refUserAddress"
  SET
    "refAdAdd1Type" = $2,
    "refAdAdd1" = $3,
    "refAdArea1" = $4,
    "refAdCity1" = $5,
    "refAdState1" = $6,
    "refAdPincode1" = $7,
    "refAdAdd2Type" = $8,
    "refAdAdd2" = $9,
    "refAdArea2" = $10,
    "refAdCity2" = $11,
    "refAdState2" = $12,
    "refAdPincode2" = $13
  WHERE "refStId" = $1
  RETURNING *;
`;

export const updateHistoryQuery1 = `
  INSERT INTO public."refUserTxnHistory" (
    "transTypeId","transData","refStId", "transTime", "refUpdatedBy"
  ) VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

export const getUserData = `SELECT * FROM public."{{tableName}}" WHERE "refStId" = $1;`;
