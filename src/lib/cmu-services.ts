import axios from "axios";
import { CmuEntraIDBasicInfo } from "@/types/CmuEntraIDBasicInfo"; // อย่าลืมสร้าง type นี้ตามที่เคยคุยกัน

// ฟังก์ชันแลก Code -> Token
// ฟังก์ชันแลก Code -> Token
async function getEntraIDAccessToken(authorizationCode: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      code: authorizationCode,
      redirect_uri: process.env.CMU_ENTRAID_REDIRECT_URL || '',
      client_id: process.env.NEXT_PUBLIC_CMU_CLIENT_ID || '',
      client_secret: process.env.CMU_ENTRAID_CLIENT_SECRET || '',
      scope: process.env.SCOPE || '',
      grant_type: "authorization_code",
    });

    const response = await axios.post(
      process.env.CMU_ENTRAID_GET_TOKEN_URL!,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    return response.data.access_token;
  } catch (error: any) {
   
    console.error("Error getting EntraID Access Token:", error.response?.data || error.message);
    return null;
  }
}

// ฟังก์ชันเอา Token -> Basic Info
async function getCMUBasicInfo(accessToken: string): Promise<CmuEntraIDBasicInfo | null> {
  try {
    const response = await axios.get(
      process.env.CMU_ENTRAID_GET_BASIC_INFO!,
      { headers: { Authorization: "Bearer " + accessToken } }
    );
    return response.data;
  } catch (err) {
    console.error("Error getting CMU Basic Info:", err);
    return null;
  }
}

// ฟังก์ชันหลัก
export async function validateCMUCode(code: string) {
  const token = await getEntraIDAccessToken(code);
  if (!token) return null;
  return await getCMUBasicInfo(token);
}