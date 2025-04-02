import api from "./api";
import { parseXmlString } from "../utils/xmlUtils";

/**
 * Get swimming pool hours
 * @returns {Promise<Object>} - Pool hours data
 */
export const getPoolHours = async () => {
  try {
    const response = await api.get("/pool/hours");
    return response.data;
  } catch (error) {
    console.error("Error fetching pool hours:", error);
    throw error;
  }
};
